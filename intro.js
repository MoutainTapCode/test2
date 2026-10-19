// Sửa ba dòng chữ mở đầu tại đây. Không cần tải thêm phông chữ từ Internet.
const INTRO_COPY = {
    name: 'A3-K47 THANH OAI B',
    greeting: 'Chúc Mừng 20/10',
    flowers: 'CÁC BÔNG HOA A3-K47'
};
window.playGreetingIntro = function (onReveal = () => {}) {
    const layer = document.getElementById('greeting-intro');
    const canvas = document.getElementById('intro-particles');
    const ctx = canvas.getContext('2d');
    if (!ctx) return Promise.resolve();
    layer.hidden = false;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const count = reduced ? 900 : 2200;
    let width, height, ratio, targets, shape = 'heart', frame;
    const particles = Array.from({length: count}, () => ({
        x: Math.random(), y: Math.random(), sx: 0, sy: 0, phase: Math.random() * Math.PI * 2,
        size: .65 + Math.random() * .75
    }));
    const stars = Array.from({length: 65}, () => ({x: Math.random(), y: Math.random(), s: Math.random() * 1.5 + .5}));
    function makeTargets(kind) {
        const mask = document.createElement('canvas');
        mask.width = Math.ceil(width); mask.height = Math.ceil(height);
        const m = mask.getContext('2d');
        m.fillStyle = '#fff';
        if (kind === 'heart') {
            const scale = Math.min(width / 40, height / 38);
            m.beginPath();
            for (let j = 0; j <= 240; j++) {
                const t = j / 240 * Math.PI * 2;
                const x = width / 2 + 16 * Math.sin(t) ** 3 * scale;
                const y = height / 2 - (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) * scale;
                if (!j) m.moveTo(x,y); else m.lineTo(x,y);
            }
            m.closePath(); m.fill();
        } else {
            const lines = kind === 'name' ? [INTRO_COPY.name] : [INTRO_COPY.greeting, INTRO_COPY.flowers];
            let size = Math.min(kind === 'name' ? 76 : 68, height * .13);
            m.font = `700 ${size}px Arial, sans-serif`;
            const maxWidth = Math.max(...lines.map(t => m.measureText(t).width));
            size *= Math.min(1, width * .88 / maxWidth);
            m.font = `700 ${size}px Arial, sans-serif`;
            m.textAlign = 'center'; m.textBaseline = 'middle';
            lines.forEach((line,i) => m.fillText(line, width/2, height/2 + (i-(lines.length-1)/2)*size*1.7));
        }
        const data = m.getImageData(0,0,mask.width,mask.height).data;
        const samples = [];
        const step = Math.max(2, Math.floor(Math.min(width,height)/170));
        for(let y=0;y<height;y+=step) for(let x=0;x<width;x+=step) {
            if(data[(y*mask.width+x)*4+3]>100) samples.push({x,y});
        }
        // Trộn vị trí để các hạt đan xen khi chuyển từ trái tim sang chữ.
        for(let i=samples.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[samples[i],samples[j]]=[samples[j],samples[i]];}
        return Array.from({length:count},(_,i)=>samples[i%samples.length] || {x:width/2,y:height/2});
    }
    function resize() {
        const oldW = width || window.innerWidth, oldH = height || window.innerHeight;
        width = window.innerWidth; height = window.innerHeight;
        ratio = Math.min(devicePixelRatio || 1, 2);
        canvas.width = Math.round(width*ratio); canvas.height = Math.round(height*ratio);
        ctx.setTransform(ratio,0,0,ratio,0,0);
        for(const p of particles){p.x*=width/oldW;p.y*=height/oldH;p.sx=p.x;p.sy=p.y;}
        targets=makeTargets(shape);
    }
    resize();
    particles.forEach(p=>{p.x*=width;p.y*=height;p.sx=p.x;p.sy=p.y;});
    window.addEventListener('resize',resize);
    const hint = document.getElementById('scene-hint');
    hint.hidden = true;
    const sequence = reduced ? [
        {shape:'name',duration:3000,text:INTRO_COPY.name},
        {shape:'wish',duration:4500,text:INTRO_COPY.greeting+' · '+INTRO_COPY.flowers}
    ] : [
        {shape:'heart',duration:4500,text:'Một món quà dành riêng cho các bạn…'},
        {shape:'name',duration:6500,text:INTRO_COPY.name},
        {shape:'heart',duration:3000,text:'Gửi những điều dịu dàng nhất…'},
        {shape:'wish',duration:7500,text:INTRO_COPY.greeting+' · '+INTRO_COPY.flowers}
    ];
    let stage = -1, stageStart = 0, last = performance.now(), elapsed = 0, ending = false;
    const smooth = t => t*t*(3-2*t);
    return new Promise(resolve => {
        function finish(){cancelAnimationFrame(frame);window.removeEventListener('resize',resize);layer.hidden=true;hint.hidden=false;ctx.clearRect(0,0,width,height);resolve();}
        function next(){
            stage++; stageStart=elapsed;
            particles.forEach(p=>{p.sx=p.x;p.sy=p.y;});
            if(stage>=sequence.length){ending=true;onReveal();return;}
            shape=sequence[stage].shape;targets=makeTargets(shape);
            hint.textContent=sequence[stage].text;
        }
        next();
        function draw(now){
            // Không bỏ qua cảnh nếu người xem chuyển tab rồi quay lại.
            elapsed+=Math.min(50,Math.max(0,now-last));last=now;
            const age=elapsed-stageStart;
            if(ending && age>=1600){finish();return;}
            ctx.clearRect(0,0,width,height);
            const fade=ending ? 1-age/1600 : Math.min(1,elapsed/900);
            ctx.fillStyle=`rgba(8,2,20,${.76*fade})`;ctx.fillRect(0,0,width,height);
            for(const star of stars){ctx.globalAlpha=fade*.45;ctx.fillStyle='#ffe7f6';ctx.fillRect(star.x*width,(star.y*height+elapsed*.018)%height,star.s,star.s);}
            const t=smooth(Math.min(1,age/(reduced?200:2600)));
            ctx.fillStyle='#ffb5df';ctx.shadowColor='#ff5cba';ctx.shadowBlur=4;
            particles.forEach((p,i)=>{
                const target=targets[i];
                const swirl = reduced ? 0 : Math.sin(Math.PI*t)*Math.sin(p.phase+t*6)*Math.min(width,height)*.14;
                p.x=p.sx+(target.x-p.sx)*t+swirl;
                p.y=p.sy+(target.y-p.sy)*t+swirl*.6;
                const pulse=shape==='heart' && !reduced ? 1+Math.sin(elapsed*.003)*.018 : 1;
                const x=width/2+(p.x-width/2)*pulse, y=height/2+(p.y-height/2)*pulse;
                ctx.globalAlpha=fade*(.72+.28*Math.sin(elapsed*.002+p.phase)**2);
                const size=Math.max(.65,Math.min(width/900,1.25))*p.size;
                ctx.fillRect(x,y,size*1.5,size*1.5);
            });
            ctx.shadowBlur=0;ctx.globalAlpha=1;
            if(!ending && age>=sequence[stage].duration)next();
            frame=requestAnimationFrame(draw);
        }
        frame=requestAnimationFrame(draw);
    });
};
