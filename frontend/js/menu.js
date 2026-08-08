const menuToggle =
    document.getElementById("menuToggle");

const sidebar =
    document.querySelector(".sidebar");


menuToggle.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "menu-open"
        );

        const abierto =
            document.body.classList.contains(
                "menu-open"
            );

        sidebar.classList.toggle(
            "menu-open",
            abierto
        );

        menuToggle.setAttribute(
            "aria-expanded",
            abierto
        );

    }
);