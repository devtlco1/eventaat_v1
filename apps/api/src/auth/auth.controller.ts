import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiOperation,
  ApiBadGatewayResponse,
  ApiResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { JwtSessionGuard, type AuthedRequest } from './jwt-session.guard';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import {
  LogoutResponseDto,
  RequestOtpResponseDto,
  VerifyOtpResponseDto,
} from './dto/auth-response.dto';
import { LogoutBodyDto } from './dto/logout.dto';
import { MeResponseDto } from './dto/me-response.dto';

@ApiTags('auth')
@Controller('auth')
@ApiExtraModels(
  RequestOtpDto,
  VerifyOtpDto,
  RequestOtpResponseDto,
  VerifyOtpResponseDto,
  MeResponseDto,
  LogoutBodyDto,
  LogoutResponseDto,
)
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('otp/request')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Request OTP and dispatch via configured delivery provider',
    description:
      'Creates an OTP challenge (hashed, never returns raw code except in dev; never stored in DB in plaintext). ' +
      'Delivery is controlled by OTP_DELIVERY_PROVIDER: mock (default, local/dev), WhatsApp Cloud API, or an SMS placeholder. ' +
      'Set OTP_DELIVERY_DRY_RUN=true to avoid any outbound network calls. ' +
      'devOtp is only returned when AUTH_DEV_EXPOSE_OTP=true. ' +
      'If the WhatsApp provider is selected and delivery fails, the API returns 502 Bad Gateway and the challenge is marked failed.',
  })
  @ApiBody({ type: RequestOtpDto })
  @ApiResponse({ status: 200, type: RequestOtpResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid phone' })
  @ApiForbiddenResponse({ description: 'Account disabled or suspended' })
  @ApiBadGatewayResponse({
    description: 'WhatsApp/OTP transport failed (e.g. misconfiguration, network error, or Graph API error). Response body: code OTP_DELIVERY_FAILED.',
  })
  async requestOtp(
    @Body() body: RequestOtpDto,
    @Req() req: Request,
  ): Promise<RequestOtpResponseDto> {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip;
    return this.auth.requestOtp(body, ip, req.headers['user-agent']);
  }

  @Post('otp/verify')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verify OTP and issue access + refresh tokens' })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({ status: 200, type: VerifyOtpResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid challenge, code, or expired' })
  @ApiTooManyRequestsResponse({ description: 'Too many failed attempts' })
  @ApiForbiddenResponse({ description: 'Account cannot sign in' })
  async verifyOtp(
    @Body() body: VerifyOtpDto,
    @Req() req: Request,
  ): Promise<VerifyOtpResponseDto> {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip;
    return this.auth.verifyOtp(body, ip, req.headers['user-agent']);
  }

  @Get('me')
  @UseGuards(JwtSessionGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Current user (from access token + session)' })
  @ApiResponse({ status: 200, type: MeResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async getMe(
    @Req() req: AuthedRequest,
  ): Promise<MeResponseDto> {
    return this.auth.getMe(req.userId);
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(JwtSessionGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Revoke current session' })
  @ApiBody({ type: LogoutBodyDto, required: false })
  @ApiResponse({ status: 200, type: LogoutResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async logout(
    @Req() req: AuthedRequest,
    @Body(new DefaultValuePipe({})) body: LogoutBodyDto,
  ): Promise<LogoutResponseDto> {
    return this.auth.logout(
      req.userId,
      req.sessionId,
      body?.sessionId,
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip,
      req.headers['user-agent'],
    );
  }
}
