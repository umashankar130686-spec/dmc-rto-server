function formatDate(s){
if(!s)return '';
s=String(s).trim();
if(/^\d{4}-\d{2}-\d{2}/.test(s))return s.slice(0,10);
const months={Jan:'01',Feb:'02',Mar:'03',Apr:'04',May:'05',Jun:'06',Jul:'07',Aug:'08',Sep:'09',Oct:'10',Nov:'11',Dec:'12'};
const m1=s.match(/^(\d{2})-([A-Za-z]{3})-(\d{4})/);
if(m1)return m1[3]+'-'+(months[m1[2]]||'01')+'-'+m1[1];
const m2=s.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
if(m2)return m2[3]+'-'+m2[2]+'-'+m2[1];
const d=new Date(s);
return isNaN(d)?'':d.toISOString().slice(0,10);
}
module.exports={formatDate};
