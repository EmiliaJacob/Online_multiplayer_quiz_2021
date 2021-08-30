# found match
mosquitto_pub -t quiz/joinGame/felix -m '{"command":"foundMatch", "content":"abc"}'
mosquitto_pub -t quiz/joinGame/vanessa -m '{"command":"foundMatch", "content":"abc"}'
mosquitto_pub -t quiz/joinGame/alex -m '{"command":"foundMatch", "content":"abc"}'

# clients have 4s time to press 'Join Match'
sleep 4

mosquitto_pub -t quiz/abc -m '{"command":"gameStart", "content":"empty"}'
mosquitto_pub -t quiz/abc -m '{"command":"questions","content":{"questions":[{"id":"x","text":"Whats 3 + 4?","a":"7","b":"5","c":"1","d":"12"},{"id":"y","text":"In what year was The College Dropout released?","a":"1999","b":"2003","c":"2004","d":"2001"},{"id":"z","text":"Which one of the following whales is the biggest?","a":"Blue Whale","b":"Humpback","c":"Narwhale","d":"Basking Shark"},{"id":"a","text":"How large is Chinas population?","a":"350 755 310","b":"860 632 912","c":"1 411 778 724","d":"2 000 085 338"},{"id":"b","text":"What was the title of the first Super Mario Game?","a":"Super Mario","b":"Super Mario Bros","c":"Super Mario Run","d":"Super Mario World"}]}}'

#clients send ack that they recieved the questions
sleep 2


#----------------------------------------------------------------------------------------
    mosquitto_pub -t quiz/abc -m '{"command":"setGameMaster","content":"felix"}'
    sleep 2 
#----------------------------------------------------------------------------------------
    mosquitto_pub -t quiz/abc -m '{"command":"newRound","content":"empty"}'
    sleep 6

    mosquitto_pub -t quiz/abc -m '{"command":"selectedQuestion","content":"x"}'
    sleep 1

    mosquitto_pub -t quiz/abc -m '{"command":"startRound","content":"empty"}'
    sleep 12
#----------------------------------------------------------------------------------------
    mosquitto_pub -t quiz/abc -m '{"command":"newRound","content":"empty"}'
    sleep 6

    mosquitto_pub -t quiz/abc -m '{"command":"selectedQuestion","content":"y"}'
    sleep 1

    mosquitto_pub -t quiz/abc -m '{"command":"startRound","content":"empty"}'
    sleep 12
#----------------------------------------------------------------------------------------
    mosquitto_pub -t quiz/abc -m '{"command":"newRound","content":"empty"}'
    sleep 6

    mosquitto_pub -t quiz/abc -m '{"command":"selectedQuestion","content":"z"}'
    sleep 1

    mosquitto_pub -t quiz/abc -m '{"command":"startRound","content":"empty"}'
    sleep 12
#----------------------------------------------------------------------------------------
    mosquitto_pub -t quiz/abc -m '{"command":"setGameMaster","content":"vanessa"}'
    sleep 2 
#----------------------------------------------------------------------------------------
    mosquitto_pub -t quiz/abc -m '{"command":"newRound","content":"empty"}'

    sleep 6

    mosquitto_pub -t quiz/abc -m '{"command":"selectedQuestion","content":"b"}'
    sleep 1

    mosquitto_pub -t quiz/abc -m '{"command":"startRound","content":"empty"}'
    sleep 12
#----------------------------------------------------------------------------------------
    mosquitto_pub -t quiz/abc -m '{"command":"newRound","content":"empty"}'

    sleep 6

    mosquitto_pub -t quiz/abc -m '{"command":"selectedQuestion","content":"b"}'
    sleep 1

    mosquitto_pub -t quiz/abc -m '{"command":"startRound","content":"empty"}'
    sleep 12
#----------------------------------------------------------------------------------------
    mosquitto_pub -t quiz/abc -m '{"command":"newRound","content":"empty"}'

    sleep 6

    mosquitto_pub -t quiz/abc -m '{"command":"selectedQuestion","content":"x"}'
    sleep 1

    mosquitto_pub -t quiz/abc -m '{"command":"startRound","content":"empty"}'
    sleep 12
#----------------------------------------------------------------------------------------
    mosquitto_pub -t quiz/abc -m '{"command":"setGameMaster","content":"alex"}'
    sleep 2 
#----------------------------------------------------------------------------------------
    mosquitto_pub -t quiz/abc -m '{"command":"newRound","content":"empty"}'

    sleep 6

    mosquitto_pub -t quiz/abc -m '{"command":"selectedQuestion","content":"a"}'
    sleep 1

    mosquitto_pub -t quiz/abc -m '{"command":"startRound","content":"empty"}'
    sleep 12
#----------------------------------------------------------------------------------------
    mosquitto_pub -t quiz/abc -m '{"command":"newRound","content":"empty"}'

    sleep 6

    mosquitto_pub -t quiz/abc -m '{"command":"selectedQuestion","content":"y"}'
    sleep 1

    mosquitto_pub -t quiz/abc -m '{"command":"startRound","content":"empty"}'
    sleep 12
#----------------------------------------------------------------------------------------
    mosquitto_pub -t quiz/abc -m '{"command":"newRound","content":"empty"}'

    sleep 6

    mosquitto_pub -t quiz/abc -m '{"command":"selectedQuestion","content":"b"}'
    sleep 1

    mosquitto_pub -t quiz/abc -m '{"command":"startRound","content":"empty"}'
    sleep 12
#----------------------------------------------------------------------------------------
mosquitto_pub -t quiz/abc -m '{"command":"end","content":{"vanessa":7,"alex":5,"felix":3}}'

