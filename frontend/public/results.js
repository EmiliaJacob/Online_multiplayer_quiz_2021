function createRankingList(results) {
    var rankingList = document.getElementById('ranking');
    for(key in results){
        let position = document.createElement('li');
        position.innerHTML = key + ': ' + results[key];
        rankingList.appendChild(position);
    }
}