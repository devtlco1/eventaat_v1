import { APP_NAME } from '@eventaat/shared';

export default function HomePage() {
  return (
    <div className="appShell">
      <header className="appTopBar">لوحة التحكم — {APP_NAME}</header>
      <main className="appContent">
        <div className="card">
          <h1>واجهة الداشبورد (placeholder)</h1>
          <p className="muted">
            سيتم بناء واجهات المطعم وإدارة {APP_NAME} لاحقاً حسب الـ Product Blueprint. هذه الشاشة فقط
            لإثبات تشغيل التطبيق.
          </p>
        </div>
      </main>
    </div>
  );
}
