// =========================
// LOADER E ANIMAÇÃO INICIAL
// =========================
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'none';
        document.body.classList.remove('loading');
        document.querySelectorAll('.fade-in, .fade-in-up').forEach(el => el.style.opacity = 1);
    }, 800);
    mostrarApenasSecao('#catalogo-section');
    mostrarCatalogoCardsAnimados();
    revealOnScroll();
    initTestimonialCarousel();
    setTimeout(() => revealOnScroll(), 1000);
});

// =========================
// NAVEGAÇÃO ENTRE SEÇÕES
// =========================
function mostrarApenasSecao(id) {
    document.querySelectorAll('.content-section').forEach(sec => {
        // O formulário de agendamento só aparece via mostrarAgendamento()
        if (id === '#appointment-section') {
            if (sec.id === 'appointment-section') {
                sec.style.display = '';
            } else {
                sec.style.display = 'none';
            }
        } else {
            if ('#' + sec.id === id) {
                sec.style.display = '';
            } else if (sec.id === 'appointment-section') {
                sec.style.display = 'none';
            } else {
                sec.style.display = 'none';
            }
        }
    });
}
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        if (this.getAttribute('href').startsWith('#')) {
            e.preventDefault();
            mostrarApenasSecao(this.getAttribute('href'));
            setActiveNavLinks(this.getAttribute('href'));
            const section = document.querySelector(this.getAttribute('href'));
            if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setTimeout(() => section.focus({ preventScroll: true }), 400);
            }
        }
    });
});
function setActiveNavLinks(targetId) {
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === targetId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// =========================
// BOTÃO VOLTAR AO TOPO
// =========================
const scrollBtn = document.getElementById('scrollTopBtn');
window.addEventListener('scroll', () => {
    if (scrollBtn) scrollBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
    revealOnScroll();
});
if (scrollBtn) {
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// =========================
// ACESSIBILIDADE: FONTE E CONTRASTE
// =========================
let fontSize = 16;
const btnIncreaseFont = document.getElementById('increaseFont');
const btnDecreaseFont = document.getElementById('decreaseFont');
const btnToggleContrast = document.getElementById('toggleContrast');
if (btnIncreaseFont) {
    btnIncreaseFont.onclick = () => {
        fontSize = Math.min(fontSize + 2, 24);
        document.documentElement.style.fontSize = fontSize + 'px';
    };
}
if (btnDecreaseFont) {
    btnDecreaseFont.onclick = () => {
        fontSize = Math.max(fontSize - 2, 12);
        document.documentElement.style.fontSize = fontSize + 'px';
    };
}
if (btnToggleContrast) {
    btnToggleContrast.onclick = () => {
        document.body.classList.toggle('high-contrast');
    };
}

// =========================
// ACESSIBILIDADE: TECLAS DE ATALHO
// =========================
document.addEventListener('keydown', function(e) {
    if (e.altKey && !e.shiftKey) {
        switch (e.key) {
            case '1':
                document.querySelector('[href="#appointment-section"]')?.click();
                break;
            case '2':
                document.querySelector('[href="#works-section"]')?.click();
                break;
            case '3':
                document.querySelector('[href="#about-us-section"]')?.click();
                break;
            case '4':
                document.querySelector('[href="#account-section"]')?.click();
                break;
        }
    }
});

// =========================
// ACESSIBILIDADE: FEEDBACK POR ÁUDIO
// =========================
function speak(text) {
    if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'pt-BR';
        window.speechSynthesis.speak(utter);
    }
}

// =========================
// FORMULÁRIO DE AGENDAMENTO
// =========================
const appointmentForm = document.getElementById('appointmentForm');
const appointmentMsg = document.getElementById('appointment-message');
if (appointmentForm) {
    appointmentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        let valid = true;
        appointmentForm.querySelectorAll('input, select').forEach(input => {
            if (!input.value) valid = false;
        });
        if (!valid) {
            appointmentMsg.textContent = 'Por favor, preencha todos os campos.';
            appointmentMsg.className = 'message active error';
            speak('Por favor, preencha todos os campos do formulário de agendamento.');
            return;
        }
        appointmentMsg.textContent = 'Agendamento realizado com sucesso! Você receberá um e-mail de confirmação.';
        appointmentMsg.className = 'message active success';
        speak('Agendamento realizado com sucesso! Você receberá um e-mail de confirmação.');
        // Salva agendamento local
        const agendamento = {
            servico: appointmentForm['service'].value,
            data: appointmentForm['date'].value,
            hora: appointmentForm['time'].value
        };
        let ags = JSON.parse(localStorage.getItem('agendamentos') || '[]');
        ags.push(agendamento);
        localStorage.setItem('agendamentos', JSON.stringify(ags));
        appointmentForm.reset();
        setTimeout(() => appointmentMsg.classList.remove('active', 'success', 'error'), 7000);
        atualizarAgendamentosList();
        setTimeout(() => abrirAvaliacaoModal(), 2000);
    });
}

// =========================
// LISTA DE AGENDAMENTOS
// =========================
const agendamentosList = document.getElementById('agendamentos-list');
function atualizarAgendamentosList() {
    if (!agendamentosList) return;
    let ags = JSON.parse(localStorage.getItem('agendamentos') || '[]');
    agendamentosList.innerHTML = '<h4>Últimos Agendamentos:</h4>';
    if (ags.length === 0) {
        agendamentosList.innerHTML += '<p>Nenhum agendamento ainda.</p>';
    } else {
        agendamentosList.innerHTML += '<ul>' + ags.map(ag => `<li>${ag.servico} em ${ag.data} às ${ag.hora}</li>`).join('') + '</ul>';
    }
}
atualizarAgendamentosList();

// =========================
// FADE-IN AO ROLAR (INTERSECTION)
// =========================
function revealOnScroll() {
    const fadeSections = document.querySelectorAll('.content-section, .work-card, .team-card, .beforeafter-card, .catalogo-card');
    const windowHeight = window.innerHeight;
    fadeSections.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < windowHeight - 80) {
            el.classList.add('visible');
        }
    });
}
window.addEventListener('scroll', revealOnScroll);

// =========================
// ANIMAÇÃO DOS CARDS DO CATÁLOGO
// =========================
function mostrarCatalogoCardsAnimados() {
    document.querySelectorAll('.catalogo-card').forEach((card, i) => {
        setTimeout(() => card.classList.add('visible'), 100 + i * 120);
    });
}

// =========================
// MOSTRAR FORMULÁRIO DE AGENDAMENTO
// =========================
function mostrarAgendamento(servico = '') {
    mostrarApenasSecao('#appointment-section');
    const formSec = document.getElementById('appointment-section');
    if (formSec) {
        formSec.style.display = '';
        formSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => formSec.focus({ preventScroll: true }), 400);
    }
    // Seleciona serviço se informado
    if (servico) {
        const select = document.getElementById('service');
        if (select) {
            select.value = servico;
            select.dispatchEvent(new Event('change'));
        }
    }
}

// Botão "Agendar agora" da apresentação
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.agendar-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            mostrarAgendamento();
        });
    });
});

// Botão "Agendar este" dos cards do catálogo
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('catalogo-agendar-btn')) {
        e.preventDefault();
        const card = e.target.closest('.catalogo-card');
        if (card && card.dataset.servico) {
            mostrarAgendamento(card.dataset.servico);
        } else {
            mostrarAgendamento();
        }
    }
});

// =========================
// CARROSSEL DE DEPOIMENTOS (EXEMPLO)
// =========================
function initTestimonialCarousel() {
    const slide = document.querySelector('.testimonial-slide');
    if (!slide) return;
    const cards = Array.from(slide.children);
    let idx = 0;
    function updateCarousel() {
        cards.forEach((card, i) => {
            card.classList.toggle('active', i === idx);
        });
        let cardWidth = cards[0] ? cards[0].offsetWidth + 24 : 240;
        slide.style.transform = `translateX(-${idx * cardWidth}px)`;
    }
    updateCarousel();
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    if (prevBtn) prevBtn.onclick = () => {
        idx = (idx - 1 + cards.length) % cards.length;
        updateCarousel();
    };
    if (nextBtn) nextBtn.onclick = () => {
        idx = (idx + 1) % cards.length;
        updateCarousel();
    };
    setInterval(() => {
        idx = (idx + 1) % cards.length;
        updateCarousel();
    }, 7000);
    window.addEventListener('resize', updateCarousel);
}

// =========================
// OUTROS MÓDULOS (opcional)
// =========================
// Adicione aqui outros módulos JS do seu projeto, como modais, carrosséis, etc.

// Exemplo: Modal de avaliação (se existir)
function abrirAvaliacaoModal() {
    const modal = document.getElementById('avaliacao-modal');
    if (modal) modal.style.display = 'flex';
}

// Exemplo: Atualização de admin (se existir)
function atualizarAdmin() {
    const adminAgs = document.getElementById('admin-agendamentos');
    const adminAvals = document.getElementById('admin-avaliacoes');
    if (adminAgs) {
        let ags = JSON.parse(localStorage.getItem('agendamentos') || '[]');
        adminAgs.innerHTML = ags.slice(-5).map(ag => `<li>${ag.servico} em ${ag.data} às ${ag.hora}</li>`).join('');
    }
    if (adminAvals) {
        let avals = JSON.parse(localStorage.getItem('avaliacoes') || '[]');
        adminAvals.innerHTML = avals.slice(-5).map(av => `<li>${'★'.repeat(av.nota)} - ${av.texto}</li>`).join('');
    }
}

// =========================
// FIM DO SCRIPT