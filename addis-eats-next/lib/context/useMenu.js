import { useContext } from "react";

import { MenuContext } from "./MenuContext.js";

function useMenu() {
    const context = useContext(MenuContext);

    if (!context) {
        throw new Error(
            "useMenu must be used inside a MenuProvider"
        );
    }

    return context;
}

export default useMenu;