document.addEventListener("DOMContentLoaded", function () {
    const currentPath = window.location.pathname.replace(/\/$/, "");

    const allLinks = document.querySelectorAll(".nav-link-top, .nav-link-mobile");

    // Remove any old active before adding new
    allLinks.forEach(l => l.classList.remove("active-link"));

    allLinks.forEach(link => {
        let href = link.getAttribute("href").replace(/\/$/, "");

        if (href === currentPath) {
            link.classList.add("active-link");
        }
    });
});

function toggleMobileMenu() {
    const mobileNav = document.getElementById("mobile-nav");
    const menuIcon = document.getElementById("menu-icon");
    const closeIcon = document.getElementById("close-icon");

    mobileNav.classList.toggle("open");
    menuIcon.classList.toggle("hidden");
    closeIcon.classList.toggle("hidden");

    document.body.style.overflow = mobileNav.classList.contains("open") ? "hidden" : "";
}

lucide.createIcons();
