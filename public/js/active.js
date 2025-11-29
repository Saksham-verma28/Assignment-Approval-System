function toggleMobileMenu() {
    const mobileNav = document.getElementById("mobile-nav");
    const menuIcon = document.getElementById("menu-icon");
    const closeIcon = document.getElementById("close-icon");

    const isOpen = mobileNav.classList.toggle("open");

    if (isOpen) {
        menuIcon.style.display = "none";
        closeIcon.style.display = "block";
        document.body.style.overflow = "hidden";
    } else {
        menuIcon.style.display = "block";
        closeIcon.style.display = "none";
        document.body.style.overflow = "";
    }

}

window.onload = () => {
    lucide.createIcons();
};