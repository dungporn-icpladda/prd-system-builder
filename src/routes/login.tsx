import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "./auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "เข้าสู่ระบบ | ShopVibe" },
      { name: "description", content: "เข้าสู่ระบบเพื่อจัดการข้อมูลใน ShopVibe" },
      { property: "og:title", content: "เข้าสู่ระบบ | ShopVibe" },
      { property: "og:description", content: "เข้าสู่ระบบเพื่อจัดการข้อมูลใน ShopVibe" },
    ],
  }),
  component: AuthPage,
});
