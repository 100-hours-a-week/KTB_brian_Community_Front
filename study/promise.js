function getUserNameById(id) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve("name");
        }, 1000);
    });
}

const promise = new Promise(id, (resolve, reject) => {

	const result = getUserNameById(id);
	
	if (result.success) {
		resolve(result.user);
	}
	if (result.failed) { 
		reject()
    }
});

promise(1)
	.then((user) => {console.log(user);})
	.catch((error) => {console.log(error);});