export function minutes(time){const [h,m]=time.split(':').map(Number);return h*60+m;}
export function overlaps(a,b){return a.date===b.date&&a.status!=='cancelled'&&b.status!=='cancelled'&&minutes(a.time)<minutes(b.time)+b.duration&&minutes(b.time)<minutes(a.time)+a.duration;}
export function available(date,time,duration,visits,now=new Date()){const start=new Date(`${date}T${time}:00`);return Number.isFinite(start.getTime())&&start>now&&minutes(time)+duration<=20*60&&!visits.some(v=>overlaps({date,time,duration,status:'pending'},v));}
export function validateContact(name,phone,car){return name.trim().length>=2&&phone.replace(/\D/g,'').length>=10&&phone.replace(/\D/g,'').length<=15&&car.trim().length>=2;}
