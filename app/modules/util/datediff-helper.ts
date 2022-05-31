


export const dateDiff=(dateStart:number,dateEnd:number)=>{
    let date1 =dateStart;
    let date2 = dateEnd;
    
    let rst='';
    let calc;
    //Check which timestamp is greater
    if (date1 > date2){
            return ''
    }else{
        calc = new Date(date2 - date1) ;
    }
    //Retrieve the date, month and year
    let hours_passed = calc.getHours();
    let mins_passed = calc.getHours();
    let days_passed:number=Math.abs(calc.getDate())-1;
    let months_passed:number=Math.abs(calc.getMonth()+1)-1;
    let years_passed:number=Math.abs(calc.getFullYear()-1970)
    

    
    if (years_passed &&  years_passed>0){
        rst+=`${years_passed}y`
    }
    if (months_passed && months_passed>0){
        rst+=`${months_passed}m`
    }
    if (days_passed && days_passed>0){
        rst+=`${days_passed}d`
    }
    rst+=`${hours_passed}h${mins_passed}m`
    return rst;
}