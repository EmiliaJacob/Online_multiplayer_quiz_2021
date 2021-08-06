function hello() {
    alert("hello");
}

function changeSites() {
    fetch('http://localhost:3000/hub')
    .then (()=> {
        alert("done");
    });
}