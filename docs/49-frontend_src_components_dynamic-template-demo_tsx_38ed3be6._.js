module.exports=[197036,a=>{"use strict";var b=a.i(321248),c=a.i(651332);let d=()=>{var a,d;let e,[f,g]=(0,c.useState)("product-grid"),h={"product-grid":{data:{title:"Featured Products 🛍️",subtitle:"Check out our amazing collection",products:[{id:1,name:"MacBook Pro",price:"$1,999",rating:5},{id:2,name:"iPhone 15",price:"$1,099",rating:5},{id:3,name:"AirPods Pro",price:"$249",rating:4}]},template:`
<style>
  .container { font-family: system-ui; padding: 20px; max-width: 800px; }
  .header { text-align: center; margin-bottom: 30px; }
  .header h1 { font-size: 32px; color: #222; margin: 0; }
  .header p { font-size: 16px; color: #666; margin: 10px 0 0 0; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
  .card { border: 1px solid #ddd; border-radius: 8px; padding: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
  .card h3 { margin: 0 0 8px 0; font-size: 18px; }
  .card p { margin: 0; color: #666; }
  .price { font-size: 20px; font-weight: bold; color: #007bff; margin: 10px 0; }
  .stars { color: #ffc107; font-size: 14px; }
</style>

<div class="container">
  <div class="header">
    <h1>{{title}}</h1>
    <p>{{subtitle}}</p>
  </div>
  
  <div class="grid">
    {{#each products}}
    <div class="card">
      <h3>{{name}}</h3>
      <p class="price">{{price}}</p>
      <div class="stars">{{#repeat rating}}⭐{{/repeat}}</div>
    </div>
    {{/each}}
  </div>
</div>
      `},testimonials:{data:{title:"What Our Clients Say",testimonials:[{name:"John Doe",role:"CEO, Tech Corp",text:"Amazing service! Highly recommended.",rating:5},{name:"Jane Smith",role:"Marketing Manager",text:"Professional team, great results!",rating:5},{name:"Mike Johnson",role:"Founder, StartupXYZ",text:"Best decision we made this year.",rating:4}]},template:`
<style>
  .testimonials-container { font-family: system-ui; padding: 40px; background: #f9f9f9; border-radius: 10px; }
  .testimonials-title { font-size: 28px; font-weight: bold; margin-bottom: 30px; text-align: center; }
  .testimonials-grid { display: grid; gap: 20px; }
  .testimonial { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff; }
  .testimonial-text { font-style: italic; color: #333; margin-bottom: 15px; }
  .testimonial-author { font-weight: bold; color: #222; }
  .testimonial-role { font-size: 14px; color: #666; }
  .testimonial-rating { color: #ffc107; font-size: 16px; margin-top: 10px; }
</style>

<div class="testimonials-container">
  <h2 class="testimonials-title">{{title}}</h2>
  <div class="testimonials-grid">
    {{#each testimonials}}
    <div class="testimonial">
      <p class="testimonial-text">"{{text}}"</p>
      <div class="testimonial-author">{{name}}</div>
      <div class="testimonial-role">{{role}}</div>
      <div class="testimonial-rating">{{#repeat rating}}⭐{{/repeat}}</div>
    </div>
    {{/each}}
  </div>
</div>
      `},"hero-banner":{data:{heading:"Build Your Dream Website",subheading:"With our powerful platform in just minutes",cta:"Get Started Now",isPromo:!0,promoText:"50% OFF for First Month!"},template:`
<style>
  .hero { 
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 60px 40px;
    text-align: center;
    border-radius: 10px;
  }
  .hero h1 { font-size: 40px; margin: 0 0 15px 0; }
  .hero p { font-size: 18px; margin: 0 0 20px 0; opacity: 0.95; }
  .hero button {
    background: white;
    color: #667eea;
    border: none;
    padding: 12px 30px;
    font-size: 16px;
    font-weight: bold;
    border-radius: 5px;
    cursor: pointer;
  }
  .promo {
    background: rgba(255, 255, 255, 0.2);
    padding: 10px 20px;
    border-radius: 5px;
    margin: 15px 0;
    font-size: 14px;
    font-weight: bold;
  }
</style>

<div class="hero">
  <h1>{{heading}}</h1>
  <p>{{subheading}}</p>
  {{#if isPromo}}
  <div class="promo">{{promoText}}</div>
  {{/if}}
  <button>{{cta}}</button>
</div>
      `},faq:{data:{title:"Frequently Asked Questions",faqs:[{question:"Do I need coding knowledge?",answer:"No! Our platform is completely visual. Just drag and drop.",answered:!0},{question:"Is it mobile responsive?",answer:"Yes! All templates are fully responsive across all devices.",answered:!0},{question:"Can I use my own domain?",answer:"Absolutely! Connect any domain in seconds.",answered:!0}]},template:`
<style>
  .faq-container { font-family: system-ui; padding: 40px; max-width: 600px; }
  .faq-title { font-size: 28px; font-weight: bold; margin-bottom: 30px; }
  .faq-item { margin-bottom: 20px; }
  .faq-question { 
    background: #f0f0f0; 
    padding: 15px;
    border-radius: 5px;
    font-weight: bold;
    cursor: pointer;
  }
  .faq-answer { 
    background: #fafafa;
    padding: 15px;
    border-left: 3px solid #007bff;
    margin-top: 5px;
    color: #333;
  }
</style>

<div class="faq-container">
  <h2 class="faq-title">{{title}}</h2>
  {{#each faqs}}
  <div class="faq-item">
    <div class="faq-question">❓ {{question}}</div>
    {{#if answered}}
    <div class="faq-answer">{{answer}}</div>
    {{/if}}
  </div>
  {{/each}}
</div>
      `}}[f],i=(a=h.template,d=h.data,e=(e=(e=(e=a).replace(/{{#repeat\s+(\w+)}}([\s\S]*?){{\/repeat}}/g,(a,b,c)=>Array(d[b]||0).fill(c).join(""))).replace(/{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g,(a,b,c)=>d[b]?c:"")).replace(/{{#each\s+(\w+)}}([\s\S]*?){{\/each}}/g,(a,b,c)=>{let e=d[b];return Array.isArray(e)?e.map(a=>{let b=c;return Object.entries(a).forEach(([a,c])=>{let d=RegExp(`{{\\s*${a}\\s*}}`,"g");b=b.replace(d,String(c))}),b}).join(""):""}),Object.entries(d).forEach(([a,b])=>{if(Array.isArray(b)||"object"==typeof b&&null!==b)return;let c=RegExp(`{{\\s*${a}\\s*}}`,"g");e=e.replace(c,String(b))}),e);return(0,b.jsxs)("div",{style:{padding:"20px",backgroundColor:"#f5f5f5",minHeight:"100vh"},children:[(0,b.jsx)("h1",{children:"Dynamic Template Demo"}),(0,b.jsxs)("div",{style:{marginBottom:"20px"},children:[(0,b.jsx)("label",{style:{marginRight:"10px",fontWeight:"bold"},children:"Select Template:"}),(0,b.jsxs)("select",{value:f,onChange:a=>g(a.target.value),style:{padding:"8px 12px",borderRadius:"5px",border:"1px solid #ccc",fontSize:"14px"},children:[(0,b.jsx)("option",{value:"product-grid",children:"Product Grid"}),(0,b.jsx)("option",{value:"testimonials",children:"Testimonials"}),(0,b.jsx)("option",{value:"hero-banner",children:"Hero Banner"}),(0,b.jsx)("option",{value:"faq",children:"FAQ Section"})]})]}),(0,b.jsx)("div",{style:{backgroundColor:"white",borderRadius:"8px",padding:"20px",boxShadow:"0 2px 10px rgba(0,0,0,0.1)"},children:(0,b.jsx)("div",{dangerouslySetInnerHTML:{__html:i}})}),(0,b.jsxs)("div",{style:{marginTop:"20px",backgroundColor:"white",padding:"20px",borderRadius:"8px"},children:[(0,b.jsx)("h3",{children:"Template HTML:"}),(0,b.jsx)("pre",{style:{backgroundColor:"#f5f5f5",padding:"10px",borderRadius:"5px",overflow:"auto",fontSize:"12px",maxHeight:"300px"},children:h.template}),(0,b.jsx)("h3",{children:"Data:"}),(0,b.jsx)("pre",{style:{backgroundColor:"#f5f5f5",padding:"10px",borderRadius:"5px",overflow:"auto",fontSize:"12px",maxHeight:"300px"},children:JSON.stringify(h.data,null,2)})]})]})};a.s(["DynamicTemplateDemoSimple",0,d,"default",0,d])}];

//# sourceMappingURL=frontend_src_components_dynamic-template-demo_tsx_38ed3be6._.js.map