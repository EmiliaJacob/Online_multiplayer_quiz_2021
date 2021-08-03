class Queue
{
    constructor()
    {
        this.items = [];
    }
                  

	enqueue(element)
	{	
		// adding element to the queue
		this.items.push(element);
	}

	dequeue()
	{
		if(this.isEmpty())
			return false;
		return this.items.shift();
	}

	isEmpty()
	{
		return this.items.length == 0;
	}
   
}

class SessionID
{
	constructor()
	{
		this.idQ = new Queue;
		for(let i=0; i<1000;i++){
				this.idQ.enqueue(i);
		}
	}
}

class Session
{
	constructor(sessionID, masterID, nickName)
	{
		this.sessionID = sessionID;
		this.players = [[masterID,nickName]];
		this.masterID = masterID;
		this.timeLimit = time;
		this.rounds = rounds;
		this.nbrQstRnd = number;
	}	
	
	addPlayer(nickName, playerID)
	{
		this.players.push([nickName, playerID]);
	}	
	 
	swapMaster(ID)
	{
		this.masterID = ID;
	}	


}	