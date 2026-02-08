const CONFIG = {
        nasaApodEndpoint: 'https://api.nasa.gov/planetary/apod',
        nasaApiKey: 'jS4kVfkGWVL4gLRYt0o73WUF11HtZqF3bln57xDf',
}

const el = {
        inputData: document.getElementById('apodDate'),
        btnCarregar: document.getElementById('btnLoad'),
        btnHoje: document.getElementById('btnToday'),
        btnAleatorio: document.getElementById('btnRandom'),
        btnAbrir: document.getElementById('btnOpen'),
        btnCopiar: document.getElementById('btnCopy'),
        btnBaixar: document.getElementById('btnDownload'),

        midia: document.getElementById('media'),
        titulo: document.getElementById('apodTitle'),
        dataLabel: document.getElementById('apodDateLabel'),
        tipo: document.getElementById('apodType'),
        explicacao: document.getElementById('apodExplain'),
        copyright: document.getElementById('apodCopyright'),
        toast: document.getElementById('toast'),
}

function dataHojeIso(date = new Date()) {
        const ano = date.getFullYear()
        const mes = String(date.getMonth() + 1).padStart(2, '0')
        const dia = String(date.getDate()).padStart(2, '0')
        return `${ano}-${mes}-${dia}`
}

function textoOuTraco(valor, fallback = '—') {
        const s = typeof valor === 'string' ? valor.trim() : ''
        return s.length ? s : fallback
}

function estaDigitando() {
        const ativo = document.activeElement
        if (!ativo) return false
        const tag = (ativo.tagName || '').toLowerCase()
        return tag === 'input' || tag === 'textarea' || ativo.isContentEditable === true
}

function mostrarToast(mensagem, tipo) {
        el.toast.textContent = mensagem
        el.toast.className = 'toast show'
        if (tipo === 'ok') el.toast.classList.add('ok')
        if (tipo === 'err') el.toast.classList.add('err')

        window.clearTimeout(mostrarToast._t)
        mostrarToast._t = window.setTimeout(() => {
                el.toast.className = 'toast'
                el.toast.textContent = ''
        }, 2600)
}

function definirCarregando(ativar) {
        el.midia.setAttribute('aria-busy', String(ativar))
        el.midia.classList.toggle('skeleton', ativar)
        el.btnCarregar.disabled = ativar
        el.btnHoje.disabled = ativar
        el.btnAleatorio.disabled = ativar
        el.btnCopiar.disabled = ativar

        if (ativar) {
                renderizarBadge('Carregando…')
        }
}

function montarUrlApod({ data, aleatorio }) {
        const url = new URL(CONFIG.nasaApodEndpoint)
        url.searchParams.set('api_key', CONFIG.nasaApiKey)
        url.searchParams.set('thumbs', 'true')

        if (aleatorio) {
                url.searchParams.set('count', '1')
                return url
        }

        if (data) {
                url.searchParams.set('date', data)
        }

        return url
}

async function buscarApod({ data, aleatorio } = {}) {
        const url = montarUrlApod({ data, aleatorio })

        const resposta = await fetch(url, {
                headers: {
                        Accept: 'application/json',
                },
        })

        let json
        try {
                json = await resposta.json()
        } catch {
                json = null
        }

        if (!resposta.ok) {
                const msg = json?.msg || json?.error?.message || `Erro HTTP ${resposta.status}`
                throw new Error(msg)
        }

        if (Array.isArray(json)) return json[0]
        return json
}

function limparElemento(elemento) {
        while (elemento.firstChild) elemento.removeChild(elemento.firstChild)
}

function renderizarBadge(texto) {
        const badge = document.createElement('span')
        badge.className = 'badge'
        badge.textContent = texto
        el.midia.appendChild(badge)
}

function configurarAcoes({ linkAbrir, linkDownload, podeBaixar }) {
        el.btnAbrir.href = linkAbrir || '#'
        el.btnAbrir.style.pointerEvents = linkAbrir ? 'auto' : 'none'
        el.btnAbrir.style.opacity = linkAbrir ? '1' : '.55'

        el.btnBaixar.href = linkDownload || '#'
        el.btnBaixar.style.pointerEvents = podeBaixar ? 'auto' : 'none'
        el.btnBaixar.style.opacity = podeBaixar ? '1' : '.55'
        el.btnBaixar.setAttribute('aria-disabled', String(!podeBaixar))
}

function renderizarMidia(apod) {
        const tipoMidia = apod?.media_type
        const titulo = textoOuTraco(apod?.title)

        limparElemento(el.midia)

        if (tipoMidia === 'video') {
                renderizarBadge('Vídeo')

                const iframe = document.createElement('iframe')
                iframe.src = apod?.url
                iframe.title = titulo
                iframe.loading = 'lazy'
                iframe.referrerPolicy = 'no-referrer'
                iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                iframe.allowFullscreen = true

                el.midia.appendChild(iframe)
                configurarAcoes({ linkAbrir: apod?.url, linkDownload: null, podeBaixar: false })
                return
        }

        const urlImagem = apod?.hdurl || apod?.url
        renderizarBadge('Imagem')

        const img = document.createElement('img')
        img.src = urlImagem
        img.alt = titulo
        img.loading = 'lazy'
        el.midia.appendChild(img)

        configurarAcoes({ linkAbrir: urlImagem, linkDownload: urlImagem, podeBaixar: true })
}

function renderizarApod(apod) {
        el.titulo.textContent = textoOuTraco(apod?.title)
        el.dataLabel.textContent = textoOuTraco(apod?.date)
        el.tipo.textContent = apod?.media_type === 'video' ? 'Vídeo (embed)' : 'Imagem'
        el.explicacao.textContent = textoOuTraco(apod?.explanation)
        el.copyright.textContent = apod?.copyright
                ? `© ${apod.copyright}`
                : '© Domínio público / Crédito não informado'

        renderizarMidia(apod)
}

function renderizarErro(mensagem) {
        el.titulo.textContent = 'Falha ao carregar'
        el.dataLabel.textContent = '—'
        el.tipo.textContent = '—'
        el.explicacao.textContent = 'Verifique sua conexão e tente novamente.'
        configurarAcoes({ linkAbrir: null, linkDownload: null, podeBaixar: false })

        limparElemento(el.midia)
        renderizarBadge('Erro')

        const box = document.createElement('div')
        box.style.padding = '16px'

        const p1 = document.createElement('p')
        p1.style.margin = '0'
        p1.style.color = 'rgba(255,255,255,.85)'
        p1.textContent = 'Não foi possível carregar agora.'

        const p2 = document.createElement('p')
        p2.style.margin = '8px 0 0'
        p2.style.color = 'rgba(255,255,255,.65)'
        p2.style.fontSize = '13px'
        p2.textContent = textoOuTraco(mensagem, 'Erro desconhecido')

        box.appendChild(p1)
        box.appendChild(p2)
        el.midia.appendChild(box)
}

async function carregarApod({ data, aleatorio } = {}) {
        definirCarregando(true)
        try {
                const apod = await buscarApod({ data, aleatorio })
                renderizarApod(apod)

                if (!aleatorio && data) {
                        localStorage.setItem('apod:lastDate', data)
                }

                mostrarToast('APOD carregado com sucesso.', 'ok')
        } catch (err) {
                renderizarErro(err?.message)
                mostrarToast(textoOuTraco(err?.message, 'Erro ao carregar.'), 'err')
        } finally {
                definirCarregando(false)
        }
}

async function copiarLinkAtual() {
        const link = el.btnAbrir.href
        if (!link || link === '#' || link.endsWith('#')) {
                mostrarToast('Sem link para copiar.', 'err')
                return
        }

        try {
                await navigator.clipboard.writeText(link)
                mostrarToast('Link copiado!', 'ok')
        } catch {
                const textarea = document.createElement('textarea')
                textarea.value = link
                textarea.setAttribute('readonly', 'true')
                textarea.style.position = 'fixed'
                textarea.style.left = '-9999px'
                document.body.appendChild(textarea)
                textarea.select()
                document.execCommand('copy')
                textarea.remove()
                mostrarToast('Link copiado!', 'ok')
        }
}

function iniciar() {
        const hoje = dataHojeIso()
        el.inputData.max = hoje

        const dataSalva = localStorage.getItem('apod:lastDate')
        el.inputData.value = dataSalva && dataSalva <= hoje ? dataSalva : hoje

        el.btnCarregar.addEventListener('click', () => {
                const data = el.inputData.value || hoje
                carregarApod({ data })
        })
        el.btnHoje.addEventListener('click', () => {
                el.inputData.value = hoje
                carregarApod({ data: hoje })
        })
        el.btnAleatorio.addEventListener('click', () => {
                carregarApod({ aleatorio: true })
        })
        el.btnCopiar.addEventListener('click', copiarLinkAtual)
        document.addEventListener('keydown', (e) => {
                if (estaDigitando()) return
                const tecla = (e.key || '').toLowerCase()
                if (tecla === 'r') {
                        carregarApod({ aleatorio: true })
                }
                if (tecla === 't') {
                        el.inputData.value = hoje
                        carregarApod({ data: hoje })
                }
        })
        carregarApod({ data: el.inputData.value })
}
iniciar()
//-----------Parâmetro Catch(Erro personalizado)-----------------------
try {
  throw new TypeError("Erro customizado", {
    cause: {
      detalhes: "Detalhes do Erro",
      codigo: 123
    }
  })
} catch(e) {
 console.log(e.name)
 console.log(e.message)
 console.log(e.stack)
 console.log(e.cause)
 console.log(e.cause.detalhes)
 console.log(e.cause.codigo)
}
