import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.4.1/firebase-app.js';
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, deleteField } from 'https://www.gstatic.com/firebasejs/9.4.1/firebase-firestore.js';
import { getStorage, ref, listAll, getMetadata, getDownloadURL, uploadBytes, deleteObject, uploadBytesResumable } from 'https://www.gstatic.com/firebasejs/9.4.1/firebase-storage.js';
import { getAuth, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/9.4.1/firebase-auth.js';
import Highcharts from 'https://code.highcharts.com/es-modules/masters/highcharts.src.js';
import 'https://code.highcharts.com/es-modules/masters/modules/data.src.js';
import 'https://code.highcharts.com/es-modules/masters/modules/accessibility.src.js';

(async() => {
    var fbc = await fetch(`${location.pathname.split('/')[1] == 'sample' ? '/sample' : ''}/fbc.json`);
    var fbc = await fbc.json();

    initializeApp(fbc);
    window.db = getFirestore();
    window.st = getStorage();
    window.$ = document.querySelector.bind(document);
    window.$$ = document.querySelectorAll.bind(document);

    HTMLElement.prototype.$ = HTMLElement.prototype.querySelector;
    HTMLElement.prototype.$$ = HTMLElement.prototype.querySelectorAll;
    FileList.prototype.forEach = Array.prototype.forEach;

    const auth = getAuth();
    const ls = localStorage;
    const ss = sessionStorage;
    const de = decodeURI;
    const en = encodeURI;
    window.fb = { from: {}, img: {}, csv: {}, pdf: {} };
    const is = {
        sample: fbc.authDomain.includes('sample') ? '/sample' : '',
        code: en('</code>'),
        csv: RegExp('.csv'),
        img: RegExp('.gif|.png|.jpg|.jpeg|.webp'),
        vid: RegExp('.mp4|.mov'),
        pdf: RegExp('.pdf'),
        loaded: false
    };
    const head = document.head;
    const body = document.body;
    if (ls.cMode == undefined) { ls.cMode = 1; }
    document.documentElement.setAttribute('cMode', ls.cMode);
    const css_load = `z-index:5; position: fixed; width:100%; height:100%; background: ${ls.cMode == '1' ? '#0d1117' : '#fff'}; left:0; top:0; transition:ease .5s`;
    const css_gif = `position:absolute; width:100px; height:100px; top:calc(50% - 50px); left:calc(50% - 50px);`;

    body.innerHTML = `<load style="${css_load}"><img src='${is.sample}/load_${is.sample ? 'main' : ls.cMode == '1' ? 'dark' : 'light'}.gif' style="${css_gif}"></load>`;
    body.innerHTML += `<nav></nav><section><article></article></section><aside></aside><clip></clip>`;
    document.title = is.sample.length ? '불로구' : '블로그';

    const nav = $('nav');
    const section = $('section');
    const aside = $('aside');
    const clip = $('clip');
    const u = {};
    const kb = 1024;
    u.prp = 'https://cdn.jsdelivr.net/gh/google/code-prettify@master/loader/run_prettify.js';
    u.trv = 'https://s3.tradingview.com/tv.js';

    head.innerHTML += `<meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, user-scalable=no" />`;
    head.innerHTML += `<link rel="shortcut icon" type="image/x-icon" href="${is.sample.length ? '/sample/main.png' : '/title.gif'}"/>`

    if (ss.mchangeWidth == undefined) { ss.mchangeWidth = 0; }
    if (ls.clipBoard == undefined) { ls.clipBoard = JSON.stringify({ 'index': 0 }); }
    clip.onclick = () => { clip.classList.toggle('clip') }

    var article;
    var url;

    (async() => {
        url = getUrl(location.pathname);
        url.push('index', 'index', 'index');
        url = url.slice(0, 3);
        is.lazyload = url[0] == 'life';
        is.tree = url.join('/') == `index/tree/index`;
        window.is = is;
        section.classList.add(url[0]);
        console.log(url);
        listAll(ref(st, url.join('/'))).then(strg => {
            if (strg) {
                strg.items.forEach(e => {
                    if (is.vid.test(e.name) || is.img.test(e.name)) {
                        fb.img[e.name] = e;
                    } else if (is.csv.test(e.name)) {
                        fb.csv[e.name] = e;
                    } else if (is.pdf.test(e.name)) {
                        fb.pdf[e.name] = e;
                    }
                });
            }
        }).then(() => {
            setImage();
        });

        var c = JSON.parse(ls.clipBoard);
        for (var i = 0; i < 5; i++) {
            var j = (c.index + i) % 5;
            if (c[j] != undefined) {
                var p = document.createElement('p');
                p.innerText = c[j];
                clip.append(p);
            }
        }
        clip.childNodes.forEach(e => { e.onclick = () => { navigator.clipboard.writeText(e.innerText) } })

        ls.edit = true;
        if (ls.uid == undefined) { ls.log = false, ls.uid = null; }
        fval(u.trv);

        fb.dsrc = doc(db, 'index', 'source');
        fb.dtre = doc(db, 'index', 'tree');
        fb.srce = await getDoc(fb.dsrc);
        fb.srce = fb.srce.data();
        fb.user = await getDoc(doc(db, 'user', ls.uid));
        fb.user = fb.user.data();
        fb.tree = await getDoc(fb.dtre);
        fb.tree = fb.tree.data();
        head.innerHTML += de(fb.srce.css.true);

        if (fb.user) {
            nav.innerHTML = de(fb.srce.nav[ls.log]);
            aside.innerHTML = de(fb.srce.aside[ls.log]);
            if (ls.uid != 'null' && ls.uid != 'undefined') {
                setTree();
            }
        } else {
            body.innerHTML = '';
            signout();
        }

        $('nav>div>span').onclick = e => {
            ls.cMode = 1 - ls.cMode;
            document.documentElement.setAttribute('cMode', ls.cMode);
        }

        if (!is.tree) {
            fb.html = doc(db, url[0], url[1]);
            fb.dict = await getDoc(fb.html);
            fb.dict = fb.dict.data();
        }
    })().then(() => {
        var portal = document.createElement('portal');
        for (var i = 0; i < url.length; i++) {
            if (url[i] != 'index') {
                portal.innerHTML += `/<a href=/${url.slice(0, i + 1).join('/')}/>${url[i]}</a>`;
            }
        }
        section.append(portal);
        section.innerHTML += de(fb.srce.es[fb.user.auth]);

        article = $('article');
        setData(getData(ls.log));
        unload();
        if (ls.prp) { fval(u.prp); }
        head.innerHTML += de(fb.srce.prps[ls.prp]);
    }).then(() => {
        document.onkeydown = e => {
            if (e.ctrlKey && e.keyCode == 69) {
                e.preventDefault();
                edit();
            }
        }
    }).catch(e => {
        unload();
        $('article').innerText = `\n${e.stack}\n\n${$('script[type=module]').src}`;
        throw e;
    });

    function setTree() {
        var t = Object.values(fb.tree).filter(e => e.source == undefined),
            c = 0,
            d = 0;
        t.flat().forEach(e => {
            Object.values(e).forEach(f => {
                if (typeof(f) == 'object') {
                    c += Object.values(f).length;
                    Object.values(f).forEach(g => {
                        d += parseInt(g);
                    });
                } else {
                    c++;
                    d += parseInt(f);
                }
            });
        });
        $('aside>div').innerHTML = `<p>${t.length} 주제</p><p>${c} 문서</p><p>${numByte(d)}</p>`;
    }

    function getUrl(s) {
        s = de(s).toLowerCase().split('/').slice(1).filter(e => e != '');
        if (is.sample.length && s[0] == 'sample') {
            s = s.slice(1);
        }
        return s;
    };

    function unload() {
        if ($('load')) {
            $('load').style.opacity = 0;
            setTimeout(() => { $('load').remove(); }, 500);
        }
    }

    function fval(src, asy = true) {
        fetch(src)
            .then(r => { return r.text() })
            .then(r => eval(asy ? `(async()=>{${r}})()` : r));
    }

    function getData(x) {
        if (is.tree) {
            return fb.tree;
        } else if (fb.dict) {
            if (url[2] in fb.dict) {
                var r = fb.dict[url[2]][x];
                ls.prp = r.includes(is.code);
                return de(r);
            } else {
                return de(fb.srce.create.true);
            }
        } else {
            return de(fb.srce.create.true);
        }
    }

    function setScript(script) {
        script.forEach(scr => {
            if (scr.src) {
                fval(scr.src, false);
            } else {
                eval(scr.innerText);
            }
        });
    }

    function setData(index) {
        var e = document.createElement('html');
        if (is.tree) {
            const keys = new Set();
            JSON.stringify(fb.tree, (k, v) => (keys.add(k), v));
            e.innerHTML = JSON.stringify(fb.tree, Array.from(keys).sort(), 2);
            article.style['white-space'] = 'break-spaces';
        } else {
            e.innerHTML = index.replaceAll('\u00a0', ' ');
        }
        var scrsrc = e.$$('script[src]');
        var script = e.$$('script:not([src])');
        scrsrc.forEach(scr => { scr.remove() });
        script.forEach(scr => { scr.remove() });
        article.innerHTML = e.innerHTML;
        setFigure();
        setBlindPdf();
        setIndex();
        setFold();
        setMenu();
        setScript(script);
        setCode();
        setAnchor();
        setChart();
        setTree();
        if (location.hash) { location.href = location.hash; }
        section.classList.remove('e-s');
        article.classList.remove('e-a');
        clip.classList.remove('clip');
    }

    function setMenu() {
        if ($('from')) {
            $$('from').forEach(async e => {
                var name = e.getAttribute('name').toLowerCase();
                e.onclick = () => { e.classList.toggle('view'); }
                if (name in fb.from) {
                    var d = fb.from[name];
                } else {
                    var d = await getDoc(doc(db, 'from', name));
                    if (d) {
                        d = d.data();
                        if (d) {
                            d = de(d.index.true);
                            fb.from[name] = d;
                        } else {
                            e.innerHTML = name;
                        }
                    } else {
                        e.innerHTML = name;
                    }
                }
                var t = document.createElement('div');
                t.classList.add('from');
                t.innerHTML = d;
                var h1 = t.$('h1');
                if (h1) {
                    h1.remove();
                    h1 = h1.innerHTML;
                }
                e.innerHTML = `<a href=${is.sample}/from/${name}/><b>${h1 ? h1 : e.innerHTML}</b></a>`;
                e.after(t);
                setAnchor();
            })
        }
        if ($('pubchem')) {
            $$('pubchem').forEach(e => {
                var type = e.getAttribute('type');
                var name = e.getAttribute('name');
                if (!name) {
                    name = url[1];
                }
                if (!type) {
                    type = '3D-Conformer';
                }
                var i = document.createElement('iframe');
                i.src = `https://pubchem.ncbi.nlm.nih.gov/compound/${name}#section=${type}&embed=true`
                e.append(i);
            })
        }
    }

    function setFold() {
        var h1 = $('h1');
        if (h1) {
            var f = h1.getAttribute('fold');
            var b = h1.getAttribute('blind');
            $$(`article>*:not(index) ${f}, article>${f}`).forEach(e => {
                e.onclick = () => { e.classList.toggle('fold') };
                e.classList.add('foldable');
            })
            $$(`article>*:not(index) ${b}, article>${b}`).forEach(e => {
                e.classList.add('blind');
            })
        }
    }

    function setCode() {
        if (ls.prp && $('code')) {
            var but = document.createElement('button');
            but.innerText = 'Compile';
            but.onclick = () => {
                var form = document.createElement('form');
                var text = document.createElement('textarea');
                text.name = 'initScript';
                text.value = $('code').innerText.trim().replaceAll('\u00a0', ' ');
                form.action = 'https://www.jdoodle.com/api/redirect-to-post/c-online-compiler';
                form.method = 'POST';
                form.target = '_blank';
                form.append(text);
                article.append(form);
                form.submit();
            }
            article.append(but);
        }
    }

    function findAnchor(tree, link, len = false) {
        if (!tree[link[0]]) {
            return false;
        } else if (link.length > 1 && link[1] != 'index') {
            return findAnchor(tree[link[0]], link.slice(1));
        } else {
            if (len) {
                tree[link[0]] = len;
            }
            return tree[link[0]];
        }
    }

    function delAnchor(link) {
        var t = {};
        t[link[0]] = fb.tree[link[0]]
        while (link[link.length - 1] == 'index') {
            link = link.slice(0, link.length - 1);
        }
        if (link.length == 3) {
            delete t[link[0]][link[1]][link[2]];
        }
        if (link.length > 1) {
            if (Object.keys(t[link[0]][link[1]]).length == 0) {
                delete t[link[0]][link[1]];
            }
        }
        updateDoc(fb.dtre, t);
    }

    function addAnchor(link) {
        var t = {},
            l = unescape(encodeURIComponent($('edit').innerHTML)).length;
        findAnchor(fb.tree, link, l);
        t[link[0]] = fb.tree[link[0]]
        while (link[link.length - 1] == 'index') {
            link = link.slice(0, link.length - 1);
        }
        if (link.length == 1) {
            if (t[link[0]] == undefined) {
                t[link[0]] = l;
            }
        } else {
            if (typeof(t[link[0]]) != 'object') {
                t[link[0]] = {};
            }
            if (link.length == 2) {
                if (typeof(t[link[0]][link[1]]) != 'object') {
                    t[link[0]][link[1]] = l;
                }
            } else if (link.length == 3) {
                if (typeof(t[link[0]][link[1]]) != 'object') {
                    t[link[0]][link[1]] = {};
                }
                t[link[0]][link[1]][link[2]] = l;
            }
        }
        updateDoc(fb.dtre, t);
    }

    function setAnchor() {
        $$('article a:not([target])').forEach(a => {
            var link = getUrl(a.pathname);
            if (link.length) {
                if (!findAnchor(fb.tree, link)) {
                    a.classList.add('r');
                }
            }
        })
    }

    var H = '';
    var s = { '2': ['', '.'], '3': ['', ')'], '4': ['', ''], '5': ['(', ')'] };
    var hnum = { '2': '', '3': '', '4': '', '5': '' };
    var hid = { '1': '', '2': '', '3': '', '4': '', '5': '' };

    function indexing(tid, num, i) {
        var d = H[i].tagName[1];
        H[i].tid = s[d][0] + num + s[d][1];
        H[i].id = tid + H[i].tid;
        if (i < H.length - 1) {
            var nd = H[i + 1].tagName[1];
            if (d < nd) {
                hnum[d] = num;
                hid[d] = H[i].tid;
                indexing(tid + hid[d], 1, i + 1);
            } else if (d == nd) {
                indexing(tid, num + 1, i + 1);
            } else {
                indexing(Object.values(hid).slice(0, nd - 1).join(''), hnum[nd] + 1, i + 1);
            }
        }
    }

    function setIndex() {
        H = $$('h2, h3, h4, h5');
        if ($('index')) {
            var temp = '';
            if (H.length) {
                indexing('', 1, 0);
                H.forEach(e => {
                    temp += `<${e.tagName}><a href="#${e.id}">${e.tid}</a> ${e.innerText}</${e.tagName}>`
                    e.innerHTML = `<a href="#">${e.tid}</a> ` + e.innerHTML;
                });
            }
            $('index').innerHTML = temp;
        }
    }

    function setImage() {
        Object.values(fb.img).forEach(e => {
            getMetadata(e).then(m => { e.meta = m; });
            if (!is.lazyload) {
                e.src = 'pending';
                getDownloadURL(e).then(u => {
                    e.src = u;
                }).catch(e => {
                    unload();
                    var exc = document.createElement('exc');
                    exc.className = 'fa fa-image r';
                    section.prepend(exc);
                    throw e;
                });
            }
        });
    }

    function setFigure() {
        $$('article img').forEach(e => {
            var fig = document.createElement('figure');
            var cap = document.createElement('figcaption');
            cap.innerHTML = e.getAttribute('title');
            fig.innerHTML = e.outerHTML;
            fig.append(cap);
            e.replaceWith(fig);
            e = fig.firstChild;
            if (e.name in fb.img) {
                setFileSrc(e, fb.img[e.name]);
            }

            e.onclick = () => {
                e.classList.toggle("show");
                body.classList.toggle("blur");
            };
        });
    }

    function setBlindPdf() {
        $$('blind, .blind').forEach(b => {
            var el = b.nextElementSibling;
            b.onclick = async() => {
                if (!el.src) {
                    if (el.name in fb.img) {
                        el.src = await getDownloadURL(fb.img[el.name]);
                    }
                }
                el.$$('img').forEach(async ch => {
                    if (!ch.src) {
                        if (ch.name in fb.img) {
                            ch.src = await getDownloadURL(fb.img[ch.name]);
                        }
                    }
                });
                b.classList.toggle('view');
            }
        });
        if (!is.lazyload) {
            Object.values(fb.pdf).forEach(e => {
                var el = $(`[name="${e.name}"]`);
                if (el) {
                    el.setAttribute('scrolling', 'no')
                    var wrap = document.createElement('div');
                    var full = document.createElement('full');
                    full.className = 'fa fa-expand';
                    full.onclick = () => {
                        wrap.firstChild.classList.toggle("show");
                        body.classList.toggle("blur");
                    }
                    wrap.innerHTML = el.outerHTML;
                    wrap.append(full);
                    wrap.style.position = 'relative';
                    wrap.style.width = 'fit-content';
                    el.replaceWith(wrap);
                }
            });
        }
    }

    function setFileSrc(h, e) {
        var p = h;
        while (p) {
            p = p.parentNode;
            if (!p.offsetHeight) {
                return
            }
        }
        if (!e.src) {
            getDownloadURL(fb.img[e.name]).then(u => { e.src = u; });
        } else if (e.src == 'pending') {
            setTimeout(() => { setFileSrc(h, e) }, 500);
        } else {
            h.src = e.src;
            h.onload = () => { h.classList.add('u') }
        }
    }

    function numByte(s) {
        if (s > 1000 * 1000) {
            return (s / (kb * kb)).toFixed(2) + ' MB';
        } else if (s > 1000) {
            return (s / kb).toFixed(2) + ' KB';
        } else {
            return s.toFixed(2) + ' B';
        }
    }

    function imgUpload(r, e, as = true) {
        var name = e.name;
        var rf = ref(st, `${url.join('/')}/${name}`);
        var task = uploadBytesResumable(rf, r);

        var size = $(`[name="${name}"]>size`);
        var bar = $(`[name="${name}"]>size>bar`);
        size.classList.add('p');
        if (as) {
            task.on('state_changed',
                (s) => {
                    var v = (s.bytesTransferred / s.totalBytes * 100);
                    var p = v.toFixed(2) + '%';
                    bar.style.width = p;
                    bar.innerText = p;
                }
            );
        }

        task.then(f => {
            rf.meta = f.metadata;
            fb.img[name] = rf;
            size.classList.remove('p');
            size.innerText = numByte(rf.meta.size);
            getDownloadURL(rf).then(u => {
                setFileStatus();
                rf.src = u;
                e.src = u;
            });
        });
    }

    function uploadFile() {
        $('article input').files.forEach(e => {
            var name = e.name;
            if (is.img.test(name)) {
                name = setFileName(e);
                imgUpload(e, name);
            } else {
                var rf = ref(st, `${url.join('/')}/${name}`);
                uploadBytes(rf, e)
                    .then(f => {
                        rf.meta = f.metadata;
                        if (is.csv.test(name)) {
                            fb.csv[name] = rf;
                        }
                        $('#img>div').prepend(createFile(rf));
                        setFileStatus();
                    });
            }
        });
        $('article input').value = '';
    }

    function imgOnclick(p) {
        var e = p.firstChild;
        if (e.tagName) {
            e.removeAttribute('src');
            e.removeAttribute('alt');
            e.removeAttribute('style');
            e.removeAttribute('class');
            p.innerText = p.innerHTML;
        } else {
            p.innerHTML = p.innerText;
            e = p.firstChild;
            if (!e.src) {
                var name = e.getAttribute('name');
                if (fb.img[name] != undefined) {
                    e.src = fb.img[name].src;
                }
            }
        }
        p.focus();
    }

    function setFileName(e) {
        for (var i = 0; i <= Object.keys(fb.img).length; i++) {
            var name = `img${i}.png`;
            if (fb.img[name] == undefined) {
                if (!e.getAttribute('name')) { e.setAttribute('name', name); }
                $('#img>div').append(createFile(e, name, true));
                fb.img[name] = 'pending';
                return name;
            }
        }
    }

    function clipbImg() {
        $$('edit img').forEach(e => {
            var p = e.parentElement;
            e.new = false;
            if (fb.img[e.name] != 'pending') {
                if (fb.img[e.name] == undefined) {
                    e.removeAttribute('name');
                    e.new = true;
                } else if (e.src != fb.img[e.name].src) {
                    e.removeAttribute('name');
                    e.new = true;
                } else if (!e.src) {
                    e.removeAttribute('name');
                    e.new = true;
                }
            }
            if (e.new) {
                setFileName(e);
                if (p.tagName.toLowerCase() != 'p') {
                    var p = document.createElement('p');
                    p.innerHTML = e.outerHTML;
                    e.replaceWith(p);
                    e = p.firstChild;
                }
                p.onclick = () => { imgOnclick(p) };
                fetch(e.src)
                    .then(r => r.blob())
                    .then(r => {
                        imgUpload(r, e);
                    });
                e.new = false;
            }
        });
    }

    function csvParse(s, d = ',') {
        var p = new RegExp((
            "(\\" + d + "|\\r?\\n|\\r|^)" +
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
            "([^\"\\" + d + "\\r\\n]*))"
        ), "gi");
        var arr = [
            []
        ];
        var tarr;
        while (tarr = p.exec(s)) {
            var sd = tarr[1];
            var v;
            if (sd.length && sd !== d) { arr.push([]); }
            if (tarr[2]) {
                v = tarr[2].replace(new RegExp("\"\"", "g"), "\"");
            } else {
                v = tarr[3];
            }
            arr[arr.length - 1].push(v);
        }
        return arr;
    }

    function makeChart(e, raw) {
        if (e.tagName == 'TBL') {
            var arr = csvParse(raw);
            var t = document.createElement('table');
            var m = arr[0].length;
            for (var i = 0; i < arr.length; i++) {
                var tr = document.createElement('tr');
                for (var j = 0; j < m; j++) {
                    tr.innerHTML += `<t${i == 0 || j == 0 ? 'h' : 'd'}>${arr[i][j]}</t${i == 0 || j == 0 ? 'h' : 'd'}>`;
                }
                t.append(tr);
            }
            e.append(t);
        } else {
            var stack = e.getAttribute('stack') == 'true';
            var label = e.getAttribute('label') == 'true';
            var legend = e.getAttribute('legend') == 'true';
            var o = {
                chart: {},
                title: {},
                data: { csv: raw },
                legend: { layout: 'vertical', align: 'right' },
                plotOptions: {
                    series: { dataLabels: { enabled: label }, stacking: stack, allowPointSelect: true },
                    column: { dataLabels: { enabled: label }, stacking: stack, allowPointSelect: true },
                    pie: { dataLabels: { enabled: label, distance: "-30%", }, showInLegend: legend, allowPointSelect: true, },
                    line: { dataLabels: { enabled: label }, stacking: stack, allowPointSelect: true },
                    bar: { dataLabels: { enabled: label }, stacking: stack, allowPointSelect: true }
                }
            }
            o.title.text = e.title;
            o.chart.type = e.getAttribute('type');
            o.chart.width = e.getAttribute('width');
            o.chart.height = e.getAttribute('height');
            o.legend.enabled = legend;
            Highcharts.chart(e.id, o);
        }
    }

    function setChart() {
        const trv_opt = (e) => {
            const id = e.getAttribute('name');
            e.id = id;
            const o = {
                "autosize": true,
                "symbol": id,
                "interval": "D",
                "theme": "dark",
                "locale": "kr",
                "enable_publishing": false,
                "save_image": false,
                "container_id": id,
                "hide_top_toolbar": true
            }
            if (e.getAttribute('width')) {
                delete o['autosize'];
                o.width = e.getAttribute('width');
                o.height = e.getAttribute('height');
            }
            return o;
        }
        $$('chart').forEach(async(e, i) => {
            var name = e.getAttribute('name');
            var data = e.innerHTML.trim().replaceAll('\n\n', '\n');
            var raw = fb.csv[name];
            if (!name) {
                name = `c${i}`;
            }
            e.id = name;
            if (raw) {
                raw = await getDownloadURL(raw);
                raw = await fetch(raw);
                raw = await raw.text();
            } else if (data) {
                raw = data;
            }
            makeChart(e, raw);
        })
        $$('trv').forEach(e => {
            new TradingView.widget(trv_opt(e));
        });
    }

    function insertText(sel, s) {
        var range = sel.getRangeAt(0);
        var node = document.createTextNode(s);
        sel.deleteFromDocument();
        range.insertNode(node);
        range.setStartAfter(node);
        sel.removeAllRanges();
        sel.addRange(range);
    }

    function createFile(e, name = e.name, exist = false) {
        var p = document.createElement('p');
        var span = document.createElement('span');
        var size = document.createElement('size');
        var btn = document.createElement('button');
        p.setAttribute('name', name);
        if (exist) {
            p.classList.add('exist');
        } else if (fb.dict) {
            if (de(fb.dict[url[2]].true).includes(name)) {
                p.classList.add('exist');
            }
        }
        span.onclick = () => {
            if (is.vid.test(name)) {
                navigator.clipboard.writeText(`<video autoplay muted name="${name.trim()}">`);
            } else if (is.img.test(name)) {
                navigator.clipboard.writeText(`<img name="${name.trim()}">`);
            } else if (is.csv.test(name)) {
                navigator.clipboard.writeText(`<chart type=line name=${name.trim()}></chart>`);
            }
            p.classList.add('exist');
        };
        span.innerText = name;
        btn.onclick = () => {
            if (confirm('삭제하시겠습니까?')) {
                deleteObject(ref(st, `${url.join('/')}/${name}`)).then(() => {
                    p.remove();
                    delete fb.csv[name];
                    delete fb.img[name];
                    setFileStatus();
                });
            }
        }
        btn.className = 'fa fa-trash';
        size.innerHTML = '<bar></bar>';
        setFileSize(e);
        p.append(span, size, btn);
        return p;
    }

    function setFileSize(e) {
        if (e.meta && $(`[name="${e.name}"]>size`)) {
            $(`[name="${e.name}"]>size`).innerText = numByte(e.meta.size);
        } else {
            setTimeout(() => { setFileSize(e) }, 300);
        }
    }

    function setFileEdit() {
        if ($('#img')) {
            $('#img>div').innerHTML = '';
            Object.values(fb.img).forEach(e => { $('#img>div').append(createFile(e)) })
            Object.values(fb.csv).forEach(e => { $('#img>div').append(createFile(e)) })
        }
    }

    function setFileStatus() {
        var status = $('status');
        (async() => {
            if (status) {
                status.innerText = '';
                var div = document.createElement('div');
                var span = document.createElement('span');
                var sum = 0;
                Object.values(fb.img).forEach(v => { sum += v.meta.size; });
                Object.values(fb.csv).forEach(v => { sum += v.meta.size; });
                var perc = sum / (50 * kb * kb);
                span.innerText = `${numByte(sum)} / 50MB (${(perc * 100).toFixed(1)}%)`;
                div.style.width = `${perc * $('status').clientWidth}px`;
                status.append(span, div);
            }
        })().catch(e => {
            setTimeout(setFileStatus, 1000);
        });
    }

    var autosave;
    var autostop;

    function edit() {
        var autosave = setInterval(save, 60 * 1000, true);
        var autostop = setTimeout(() => { clearInterval(autosave), save(0) }, 5 * 60 * 1000);
        body.classList.remove('blur');
        $$('input[name="type"]').forEach(e => { e.onclick = () => { ls.edit = e.value, $('edit').innerText = getData(e.value); } });
        (async() => {
            article.innerHTML = `<edit contenteditable=true></edit>${de(fb.srce.file.true)}`
        })().then(() => {
            $('edit').focus();
            $('edit').onkeydown = e => {
                if (e.ctrlKey && e.keyCode == 83) {
                    e.preventDefault();
                    if (Object.values(fb.img).includes('pending') || Object.values(fb.csv).includes('pending')) {
                        alert('사진 업로드 중입니다.');
                    } else {
                        save();
                        clearInterval(autosave);
                        clearTimeout(autostop);
                    }
                } else if (e.keyCode == 9) {
                    e.preventDefault();
                    insertText(getSelection(), '\u00a0\u00a0\u00a0\u00a0');
                } else if (e.altKey && e.keyCode == 86) {
                    if (/mac|iPhone|ipad|iPod/i.test(navigator.platform)) {
                        e.preventDefault();
                        var r = getSelection().getRangeAt(0).getBoundingClientRect();
                        clip.classList.toggle('clip');
                        clip.style.top = r.bottom;
                        clip.style.left = r.right;
                    }
                }
            }
        }).then(() => {
            if (is.tree) {
                $('edit').innerHTML = JSON.stringify(getData(ls.edit), null, 2);
            } else {
                getData(ls.edit).split(/\n/).forEach(e => {
                    var p = document.createElement('p');
                    var t = document.createElement('p');
                    p.innerText = e;
                    t.innerHTML = e;
                    if (t.$('img')) {
                        if (!is.lazyload) {
                            t.$$('img').forEach(i => {
                                if (i.getAttribute('name')) {
                                    var ti = document.createElement('p');
                                    ti.append(i);
                                    if (i.name in fb.img) {
                                        setFileSrc(i, fb.img[i.name]);
                                    }
                                    ti.classList.add('e-i')
                                    ti.onclick = () => { imgOnclick(ti) };
                                    $('edit').append(ti);
                                } else {
                                    var pi = document.createElement('p');
                                    pi.append(i.outerHTML);
                                    $('edit').append(pi);
                                }
                            });
                        } else {
                            $('edit').append(p);
                        }
                    } else if (e.length) {
                        $('edit').append(p);
                    }
                })
            }
            section.classList.add('e-s');
            article.classList.add('e-a');
            setFileEdit();
            setFileStatus();
        }).then(() => {
            $('edit').oninput = e => {
                clearTimeout(autostop);
                autostop = setTimeout(() => { clearInterval(autosave), save(0) }, 5 * 60 * 1000);
            }
            if (/mac|iPhone|ipad|iPod/i.test(navigator.platform)) {
                $('edit').oncopy = addClip;
                $('edit').oncut = addClip;
            }
            $('edit').onpaste = () => {
                setTimeout(() => { clipbImg() }, 300);
            }
        });
    }

    function addClip() {
        var d = window.getSelection().toString();
        if (d.length) {
            var s = JSON.parse(ls.clipBoard);
            var p = document.createElement('p');
            p.innerText = d;
            p.onclick = () => { navigator.clipboard.writeText(d); }
            s[s.index] = d;
            s.index = (s.index + 1) % 5;
            clip.append(p);
            if (clip.childNodes.length > 5) {
                clip.firstChild.remove();
            }
            ls.clipBoard = JSON.stringify(s);
        }
    }

    function saved(as) {
        if (!as) {
            clearInterval(autosave);
            clearTimeout(autostop);
            section.classList.remove('e-s');
            article.classList.remove('e-a');
            if (is.tree) {
                setData(fb.tree);
            } else {
                setData(de(fb.dict[url[2]][ls.edit]));
            }
            if (ls.prp) { fval(u.prp, false); }
        }
        $('es>div>span').className = 'b';
        setTimeout(() => { $('es>div>span').className = '' }, 1000);
    }

    function save(as = false) {
        if (is.tree) {
            fb.tree = JSON.parse($('edit').innerText.replaceAll('\n', ''));
            setDoc(fb.dtre, fb.tree).then(() => { saved(as); });
        } else if ($('edit')) {
            if (!as) {
                $$('edit img').forEach(e => { imgOnclick(e.parentElement); });
            }
            var d = en($('edit').innerText);
            d = d.replaceAll("&alpha;", "α")
                .replaceAll("&beta;", "β")
                .replaceAll("&gamma;", "γ")
                .replaceAll("&delta;", "δ");

            if (fb.dict == undefined) {
                fb.dict = {};
                fb.dict[url[2]] = { auth: 1, true: d, false: '' };
                setDoc(fb.html, fb.dict).then(() => { saved(as); });
                addAnchor(url);
            } else {
                if (!fb.dict[url[2]]) {
                    fb.dict[url[2]] = { auth: 1, true: '', false: '' };
                }
                if (fb.dict[url[2]].auth == 1) { fb.dict[url[2]][!ls.edit] = ''; }
                fb.dict[url[2]][ls.edit] = d;

                var t = {};
                t[url[2]] = {};
                t[url[2]].auth = fb.dict[url[2]].auth;
                t[url[2]][ls.edit] = d;
                if (fb.dict[url[2]][!ls.edit] != undefined) {
                    t[url[2]][!ls.edit] = fb.dict[url[2]][!ls.edit];
                }
                addAnchor(url);
                updateDoc(fb.html, t).then(() => { saved(as); })
            }
        }
    }

    function del() {
        if (confirm('삭제하시겠습니까?')) {
            clearInterval(autosave);
            clearTimeout(autostop);
            if (fb.dict) {
                delete fb.dict[url[2]];
                var new_dict = {};
                new_dict[url[2]] = deleteField();
                updateDoc(fb.html, new_dict).then(() => { setData(getData(ls.log)); });
                if (!Object.keys(fb.dict).length) {
                    deleteDoc(fb.html);
                    fb.dict = undefined;
                }
                delAnchor(url);
            } else {
                setData(getData(ls.log));
            }
            listAll(ref(st, url.join('/'))).then(strg => {
                if (strg) {
                    strg.items.forEach(async e => { deleteObject(ref(st, `${url.join('/')}/${e.name}`)) });
                    fb.img = {};
                    fb.csv = {};
                }
            })

        }
    }

    function signin() {
        signInWithEmailAndPassword(auth, $('#id').value, $('#pw').value)
            .then(u => {
                ls.uid = u.user.uid;
                ls.log = true;
                location.reload();
            }).catch((e) => {
                if (e.code.split('/')[1] == 'invalid-email') {
                    $('.fa-at').style.color = '#e76c6c';
                    setTimeout(() => { $('.fa-at').style.color = ''; }, 1000);
                } else {
                    $('.fa-ban').style.color = '#e76c6c';
                    setTimeout(() => { $('.fa-ban').style.color = ''; }, 1000);
                }
            });
    }

    function signout() {
        signOut(auth).then(() => {
            ls.clear();
            ss.clear();
            alert('로그아웃 되었습니다.');
            location.href = '/' + (is.sample ? 'sample' : '');
        }).catch((e) => {
            alert('로그인 정보가 없습니다.');
        });
    }

    window.save = save;
    window.edit = edit;
    window.del = del;
    window.signin = signin;
    window.signout = signout;
    window.collection = collection;
    window.getDocs = getDocs;
    window.getDoc = getDoc;
    window.uploadFile = uploadFile;
})()