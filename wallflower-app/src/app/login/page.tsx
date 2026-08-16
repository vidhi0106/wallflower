import Link from "next/link";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex justify-center relative">
      <Link
        href="/"
        className="hidden sm:block font-nunito text-[14px] no-underline absolute"
        style={{ color: "#a8977a", left: 64, top: 64 }}
      >
        ← Back
      </Link>
      <LoginForm />
    </div>
  );
}
