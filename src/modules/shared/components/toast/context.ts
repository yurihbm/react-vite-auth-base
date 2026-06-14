import type { ToastContextValue } from "./types";

import { createContext } from "react";

export const ToastContext = createContext<ToastContextValue | null>(null);
