import { RouterProvider } from "react-router";
import { router } from "./routes";

export default function Entry() {
	return <RouterProvider router={router} />;
}
