import { createRoot } from "react-dom/client";
import "./index.scss";
import { RouterProvider } from "react-router-dom";
import routes from "./routers/routes";
import { Toaster } from "sonner";

createRoot(document.getElementById("root")!).render(
    <>
        <RouterProvider router={routes} />
        <Toaster position="top-right" />
    </>,
);
