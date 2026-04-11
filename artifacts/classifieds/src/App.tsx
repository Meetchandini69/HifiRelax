import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { Toaster } from "sonner";

import HomePage from "@/pages/HomePage";
import ListingsPage from "@/pages/ListingsPage";
import LocationPage from "@/pages/LocationPage";
import StatePage from "@/pages/StatePage";
import ProfilePage from "@/pages/ProfilePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import PostProfilePage from "@/pages/PostProfilePage";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminProfilesPage from "@/pages/admin/AdminProfilesPage";
import AdminLocationsPage from "@/pages/admin/AdminLocationsPage";
import AdminSettingsPage from "@/pages/admin/AdminSettingsPage";
import AdminBoostsPage from "@/pages/admin/AdminBoostsPage";
import AdminPageContentPage from "@/pages/admin/AdminPageContentPage";
import BoostPage from "@/pages/BoostPage";
import UserSettingsPage from "@/pages/UserSettingsPage";
import DisclaimerModal from "@/components/DisclaimerModal";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1 } } });

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/dashboard/post" component={PostProfilePage} />
      <Route path="/admin" component={AdminDashboardPage} />
      <Route path="/admin/profiles" component={AdminProfilesPage} />
      <Route path="/admin/locations" component={AdminLocationsPage} />
      <Route path="/admin/settings" component={AdminSettingsPage} />
      <Route path="/admin/boosts" component={AdminBoostsPage} />
      <Route path="/admin/page-content" component={AdminPageContentPage} />
      <Route path="/dashboard/boost/:profileId" component={BoostPage} />
      <Route path="/dashboard/settings" component={UserSettingsPage} />

      <Route path="/escorts" component={ListingsPage} />
      <Route path="/escorts/:slug/:profile_slug" component={ProfilePage} />
      <Route path="/escorts/:slug" component={LocationPage} />

      <Route path="/:state_slug" component={StatePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <AuthProvider>
          <DisclaimerModal />
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
}
