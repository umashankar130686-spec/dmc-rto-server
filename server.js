const express = require('express');
const cors    = require('cors');
const fetch   = require('node-fetch');
const { formatDate } = require("./utils");
const app  = express();
const PORT = process.env.PORT || 3000;
app.use(cors({ origin: '*' }));
app.use(express.json());
const RAPIDAPI_KEY  = '5d323cce12mshdbad40dd3b9fde9p1bb040jsn9f6c4da1a73f';
const RAPIDAPI_HOST = 'vehicle-rc-information-v2.p.rapidapi.com';
const RAPIDAPI_URL  = 'https://vehicle-rc-information-v2.p.rapidapi.com/api/v1/rc/vehicleadvancedinfo';
const cache = {};
const CACHE_TTL = 30*24*60*60*1000;
function getCache(v){const e=cache[v];if(!e)return null;if(Date.now()-e.ts>CACHE_TTL){delete cache[v];return null;}return e.data;}
function setCache(v,d){cache[v]={data:d,ts:Date.now()};}
app.get('/',(req,res)=>res.json({status:'DMC RTO Server Online',cache:Object.keys(cache).length+' vehicles'}));
app.get('/rc/:vnum',async(req,res)=>{
const vnum=req.params.vnum.trim().toUpperCase().replace(/[\s\-]/g,'');
if(!vnum||vnum.length<6)return res.status(400).json({error:'Invalid vehicle number'});
const cached=getCache(vnum);
if(cached)return res.json({...cached,source:'cache',cached:true});
try{
const response=await fetch(RAPIDAPI_URL,{method:'POST',headers:{'Content-Type':'application/json','x-rapidapi-key':RAPIDAPI_KEY,'x-rapidapi-host':RAPIDAPI_HOST},body:JSON.stringify({vehicle_number:vnum})});
const json=await response.json();
if(!response.ok||json.error)return res.status(400).json({error:json.error||'API Error'});
const d=json.result||json.data||json;
const parsed={vnum,source:'live',cached:false,owner:d.owner_name||d.rc_owner||'Unknown',father:d.father_name||'',address:d.present_address||d.permanent_address||'',vehicle_class:d.class||d.vehicle_class||'',fuel:d.fuel_type||'Diesel',make:d.brand_name||d.maker_desc||'',model:d.brand_model||d.model_desc||'',year:d.registration_date?d.registration_date.slice(-4):'',color:d.color||'',chassis:d.chassis_number||d.chassis_no||'',engine:d.engine_number||d.engine_no||'',rc_status:d.rc_status||'ACTIVE',rc_expiry:formatDate(d.rc_expiry_date||d.reg_upto||''),insurance_company:d.insurance_company||'',insurance_policy:d.insurance_policy||'',insurance_expiry:formatDate(d.insurance_expiry||d.insurance_upto||''),puc_no:d.pucc_number||d.puc_no||'',puc_expiry:formatDate(d.pucc_upto||d.puc_upto||''),fitness_no:d.fitness_no||'',fitness_expiry:formatDate(d.fitness_upto||''),permit:d.permit_type||d.national_permit_number||'',permit_expiry:formatDate(d.permit_valid_upto||d.national_permit_upto||''),tax_upto:formatDate(d.tax_paid_upto||d.tax_upto||''),blacklist:d.noc_details==='NA'?'No':(d.blacklist_status||'No'),challan_pending:parseInt(d.challan||0),is_financed:d.is_financed==='1'?'Yes':'No',financer:d.financer||'',owner_count:d.owner_count||'1'};
setCache(vnum,parsed);
return res.json(parsed);
}catch(err){return res.status(500).json({error:err.message});}
});
app.listen(PORT,()=>console.log('DMC RTO Server running on port '+PORT));
