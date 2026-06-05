(async ()=>{
    try{
        const res = await fetch('../visuais/video_link.txt');
        if(!res.ok) return;
        const txt = (await res.text()).trim();
        if(!txt || txt === 'PASTE_YOUTUBE_URL_HERE') return;
        const url = txt;
        let vid = null;
        const m = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{6,})/);
        if(m) vid = m[1];
        else{
            try{
                const u = new URL(url);
                if(u.hostname.includes('youtube')){
                    const p = new URLSearchParams(u.search);
                    vid = p.get('v');
                }
            }catch(e){}
        }
        if(!vid) return;
        const params = new URLSearchParams({rel:0, controls:1, autoplay:0, vq:'hd1080'});
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${vid}?${params.toString()}`;
        iframe.setAttribute('allow','accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
        iframe.setAttribute('allowfullscreen','');
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = '0';
        const wrapper = document.getElementById('promo-video-inner') || document.querySelector('.video-wrapper');
        if(!wrapper) return;
        wrapper.innerHTML = '';
        // create responsive container
        const container = document.createElement('div');
        container.style.position = 'relative';
        container.style.paddingTop = '56.25%';
        container.appendChild(iframe);
        iframe.style.position = 'absolute';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        wrapper.appendChild(container);
    }catch(e){
        console.error('video-embed error', e);
    }
})();
