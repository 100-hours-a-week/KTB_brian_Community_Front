function after1sec(sum, value){
	setTimeout((sum, value) => {sum += value}, 1000)
}

function main(){
    let sum = 0 ;
    after1sec(sum,1);
    after1sec(sum,2);

    console.log(sum);
}

main();