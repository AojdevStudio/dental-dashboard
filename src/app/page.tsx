/**
 * Root Page Component
 *
 * This is the entry point of the application that users see when they visit the root URL.
 * Instead of rendering content directly, this page redirects users to the login page.
 *
 * The redirect happens during server-side rendering, meaning users will never actually
 * see this page rendered in the browser. This approach ensures that all users start
 * their journey through the application at the authentication entry point.
 *
 * This pattern is common in applications that require authentication for most or all
 * functionality, as it simplifies the user flow by immediately directing them to
 * the authentication process.
 */

import { redirect } from "next/navigation";

/**
 * Home Page Component
 *
 * Redirects users from the root URL (/) to the login page (/login).
 * This component doesn't render any UI as the redirect happens during
 * the server-side rendering process.
 *
 * @returns {never} This function doesn't return a component as it triggers a redirect
 */
export default function Home() {
  redirect("/login");
}
