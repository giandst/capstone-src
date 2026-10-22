import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import Header from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_auth")({
	component: AuthLayout,
	beforeLoad: async () => {
		const session = await authClient.getSession();
		if (!session.data) {
			throw redirect({
				to: "/login",
			});
		}
		return { session };
	},
});

function AuthLayout() {
	return (
		<div className="flex h-svh w-full overflow-hidden bg-background">
			<Sidebar />
			<div className="flex min-w-0 flex-1 flex-col">
				<Header />
				<main className="flex-1 overflow-y-auto bg-zinc-50 p-6 shadow-[inset_0_4px_6px_-4px_rgba(0,0,0,0.05)] dark:bg-transparent">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
