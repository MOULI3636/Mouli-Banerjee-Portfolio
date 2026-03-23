const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setupMenu() {
    const menuIcon = document.getElementById("menu-icon");
    const navlist = document.querySelector(".navlist");
    if (!menuIcon || !navlist) return;

    menuIcon.addEventListener("click", () => {
        navlist.classList.toggle("active");
        menuIcon.classList.toggle("bx-x");
        menuIcon.setAttribute("aria-expanded", navlist.classList.contains("active") ? "true" : "false");
    });

    document.querySelectorAll(".navlist a").forEach((link) => {
        link.addEventListener("click", () => {
            navlist.classList.remove("active");
            menuIcon.classList.remove("bx-x");
            menuIcon.setAttribute("aria-expanded", "false");
        });
    });
}

function setupHeaderAndProgress() {
    const header = document.querySelector(".site-header");
    const progress = document.getElementById("scrollProgress");
    const update = () => {
        if (header) header.classList.toggle("scrolled", window.scrollY > 24);
        if (progress) {
            const scrollable = document.documentElement.scrollHeight - window.innerHeight;
            const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
            progress.style.width = `${pct}%`;
        }
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
}

function setupReveal() {
    const nodes = document.querySelectorAll(".reveal");
    if (!nodes.length) return;
    if (!("IntersectionObserver" in window) || prefersReducedMotion) {
        nodes.forEach((node) => node.classList.add("in-view"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("in-view");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.18, rootMargin: "0px 0px -5% 0px" });

    nodes.forEach((node) => observer.observe(node));
}

function setupRoleText() {
    const roleNode = document.querySelector("[data-role-rotator]");
    if (!roleNode || prefersReducedMotion) return;
    const roles = (roleNode.dataset.roles || "").split("|").filter(Boolean);
    if (!roles.length) return;

    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const tick = () => {
        const current = roles[roleIndex];
        roleNode.textContent = deleting ? current.slice(0, charIndex--) : current.slice(0, charIndex++);

        if (!deleting && charIndex === current.length + 1) {
            deleting = true;
            setTimeout(tick, 1400);
            return;
        }

        if (deleting && charIndex < 0) {
            deleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            charIndex = 0;
        }

        setTimeout(tick, deleting ? 40 : 80);
    };

    tick();
}

function setupCounters() {
    const counters = document.querySelectorAll("[data-counter]");
    if (!counters.length) return;

    const animateCounter = (counter) => {
        const target = Number(counter.dataset.counter || "0");
        const suffix = counter.dataset.suffix || "";
        const duration = 1400;
        const start = performance.now();

        const frame = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            counter.textContent = `${Math.round(target * eased)}${suffix}`;
            if (progress < 1) requestAnimationFrame(frame);
        };

        requestAnimationFrame(frame);
    };

    if (!("IntersectionObserver" in window) || prefersReducedMotion) {
        counters.forEach((counter) => {
            counter.textContent = `${counter.dataset.counter || "0"}${counter.dataset.suffix || ""}`;
        });
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach((counter) => observer.observe(counter));
}

function setupTilt() {
    if (prefersReducedMotion) return;
    const cards = document.querySelectorAll(".tilt-card");
    cards.forEach((card) => {
        let frameId = null;
        card.addEventListener("pointermove", (event) => {
            const rect = card.getBoundingClientRect();
            const px = (event.clientX - rect.left) / rect.width;
            const py = (event.clientY - rect.top) / rect.height;
            const rotateY = (px - 0.5) * 10;
            const rotateX = (0.5 - py) * 10;

            if (frameId) cancelAnimationFrame(frameId);
            frameId = requestAnimationFrame(() => {
                card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
            });
        });

        const reset = () => {
            if (frameId) cancelAnimationFrame(frameId);
            card.style.transform = "";
        };

        card.addEventListener("pointerleave", reset);
        card.addEventListener("pointercancel", reset);
    });
}

function setupParallax() {
    if (prefersReducedMotion) return;
    const items = document.querySelectorAll("[data-parallax]");
    if (!items.length) return;

    let pointerX = 0;
    let pointerY = 0;
    let rafId = null;

    const update = () => {
        items.forEach((item) => {
            const strength = Number(item.dataset.parallax || "16");
            const tx = pointerX * strength;
            const ty = pointerY * strength;
            item.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
        });
        rafId = null;
    };

    window.addEventListener("pointermove", (event) => {
        pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
        pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
        if (!rafId) rafId = requestAnimationFrame(update);
    }, { passive: true });
}

function setupActiveNav() {
    const localSections = document.querySelectorAll("main section[id]");
    const navLinks = document.querySelectorAll(".navlist a");
    if (!localSections.length || !navLinks.length) return;

    const activate = () => {
        const marker = window.scrollY + 140;
        localSections.forEach((section) => {
            const top = section.offsetTop;
            const bottom = top + section.offsetHeight;
            if (marker >= top && marker < bottom) {
                navLinks.forEach((link) => link.classList.remove("active-link"));
                const link = document.querySelector(`.navlist a[href$="#${section.id}"]`);
                if (link) link.classList.add("active-link");
            }
        });
    };

    activate();
    window.addEventListener("scroll", activate, { passive: true });
}

function setupContactForm() {
    const form = document.getElementById("contactForm");
    const toast = document.getElementById("toastMessage");
    if (!form) return;

    const nextInput = document.getElementById("contactNext");
    const subjectInput = document.getElementById("contactSubject");

    if (nextInput) {
        nextInput.value = `${window.location.href.split("?")[0].split("#")[0]}?contact=success#contact`;
    }

    const params = new URLSearchParams(window.location.search);
    if (toast && params.get("contact") === "success") {
        toast.textContent = "Message sent successfully. I will receive your email details and message.";
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 2800);
        window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.hash}`);
    }

    form.addEventListener("submit", (event) => {
        const name = document.getElementById("name")?.value?.trim() || "";
        const email = document.getElementById("email")?.value?.trim() || "";
        const message = document.getElementById("message")?.value?.trim() || "";
        if (!name || !email || !message) {
            event.preventDefault();
            return;
        }

        if (subjectInput) {
            subjectInput.value = `Portfolio Contact from ${name}`;
        }
    });
}

function createBackgroundScene() {
    const container = document.getElementById("threejs-bg");
    if (!container || typeof THREE === "undefined") return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 12);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const particleCount = window.innerWidth < 768 ? 700 : 1300;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const color = new THREE.Color();

    for (let i = 0; i < particleCount; i += 1) {
        positions[i * 3] = (Math.random() - 0.5) * 24;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 18;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
        color.setHSL(0.52 + Math.random() * 0.08, 0.8, 0.55 + Math.random() * 0.18);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particles = new THREE.Points(
        particleGeometry,
        new THREE.PointsMaterial({
            size: window.innerWidth < 768 ? 0.042 : 0.034,
            vertexColors: true,
            transparent: true,
            opacity: 0.72,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        })
    );
    scene.add(particles);

    const lineMaterial = new THREE.MeshBasicMaterial({
        color: 0x66e3ff,
        wireframe: true,
        transparent: true,
        opacity: 0.12
    });

    const dodeca = new THREE.Mesh(new THREE.DodecahedronGeometry(1.15, 0), lineMaterial);
    dodeca.position.set(-3.8, 1.9, -2);
    scene.add(dodeca);

    const torus = new THREE.Mesh(new THREE.TorusKnotGeometry(0.9, 0.24, 72, 12), lineMaterial.clone());
    torus.material.opacity = 0.09;
    torus.position.set(4.3, -2.2, -3.8);
    scene.add(torus);

    const icosa = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1, 0), lineMaterial.clone());
    icosa.material.opacity = 0.08;
    icosa.position.set(2.6, 2.8, -5);
    scene.add(icosa);

    const clock = new THREE.Clock();
    let rafId = null;

    const animate = () => {
        const elapsed = clock.getElapsedTime();
        particles.rotation.y = elapsed * 0.02;
        particles.rotation.x = elapsed * 0.01;
        dodeca.rotation.x = elapsed * 0.22;
        dodeca.rotation.y = elapsed * 0.18;
        torus.rotation.x = elapsed * 0.16;
        torus.rotation.y = elapsed * 0.24;
        icosa.rotation.x = elapsed * 0.14;
        icosa.rotation.z = elapsed * 0.18;
        dodeca.position.y = 1.9 + Math.sin(elapsed * 0.8) * 0.16;
        torus.position.y = -2.2 + Math.cos(elapsed * 0.6) * 0.18;
        renderer.render(scene, camera);
        rafId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    };

    const handleVisibility = () => {
        if (document.hidden && rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        } else if (!document.hidden && !rafId && !prefersReducedMotion) {
            animate();
        }
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibility);

    if (!prefersReducedMotion) {
        animate();
    } else {
        renderer.render(scene, camera);
    }
}

function createHeroOrb() {
    const host = document.getElementById("hero-orb");
    if (!host || typeof THREE === "undefined") return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, host.clientWidth / host.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 6);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(host.clientWidth, host.clientHeight);
    host.appendChild(renderer.domElement);

    const orbGroup = new THREE.Group();
    const core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.45, 1),
        new THREE.MeshPhongMaterial({
            color: 0x59dfff,
            emissive: 0x0e2e48,
            shininess: 90,
            transparent: true,
            opacity: 0.88,
            wireframe: false,
            flatShading: true
        })
    );
    orbGroup.add(core);

    const shell = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.95, 0),
        new THREE.MeshBasicMaterial({
            color: 0x9cefff,
            wireframe: true,
            transparent: true,
            opacity: 0.25
        })
    );
    orbGroup.add(shell);

    const ring = new THREE.Mesh(
        new THREE.TorusGeometry(2.35, 0.03, 16, 120),
        new THREE.MeshBasicMaterial({ color: 0x7fffd4, transparent: true, opacity: 0.3 })
    );
    ring.rotation.x = Math.PI / 2.5;
    orbGroup.add(ring);

    scene.add(orbGroup);

    const ambient = new THREE.AmbientLight(0x7bdfff, 0.95);
    const point = new THREE.PointLight(0x7fffd4, 1.8, 18);
    point.position.set(2, 3, 4);
    scene.add(ambient, point);

    let pointerX = 0;
    let pointerY = 0;
    let rafId = null;
    const clock = new THREE.Clock();

    const animate = () => {
        const t = clock.getElapsedTime();
        orbGroup.rotation.x += 0.0035;
        orbGroup.rotation.y += 0.005;
        shell.rotation.z += 0.0025;
        ring.rotation.z += 0.003;
        orbGroup.position.y = Math.sin(t * 1.5) * 0.18;
        orbGroup.rotation.y += pointerX * 0.004;
        orbGroup.rotation.x += pointerY * 0.004;
        renderer.render(scene, camera);
        rafId = requestAnimationFrame(animate);
    };

    host.addEventListener("pointermove", (event) => {
        const rect = host.getBoundingClientRect();
        pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    });

    host.addEventListener("pointerleave", () => {
        pointerX = 0;
        pointerY = 0;
    });

    const resize = () => {
        const width = host.clientWidth || 300;
        const height = host.clientHeight || 300;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    };

    window.addEventListener("resize", resize);
    resize();

    if (!prefersReducedMotion) {
        animate();
    } else {
        renderer.render(scene, camera);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    setupMenu();
    setupHeaderAndProgress();
    setupReveal();
    setupRoleText();
    setupCounters();
    setupTilt();
    setupParallax();
    setupActiveNav();
    setupContactForm();
    createBackgroundScene();
    createHeroOrb();
});
