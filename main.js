async function collection(source, target, options = {}) {
    const { config } = options;

    const {
        port = 8765,
        deckName='英语::每日生词',
        modelName='英语单词'
    } = config;

    const queryWord = async (word) => {
        const url = 'https://dict.youdao.com/jsonapi_s'
        const params = {
            doctype: 'json',
            jsonversion: 4,
        };

        const data = {
            q: word,
            le: 'en',
            t: 2,
            client: 'web',
            sign: '4f3b645c416fd42cfec797713b4f5aa4',
            keyfrom: 'webdict',
        };

        const headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.3",
            "Host": "dict.youdao.com",
            "Referer": "https://dict.youdao.com/result",
            "Content-Type": "application/x-www-form-urlencoded"
        };
        const urlParams = new URLSearchParams(params).toString();
        const bodyParams = new URLSearchParams(data).toString();

        // 请求有道获得单词
        const response = await fetch(`${url}?${urlParams}`, {
            method: 'POST',
            headers,
            body: bodyParams,
        });
        const result = await response.json();
        if (result && result['ec']) {}
        // 单词释义
        const word_data = result['ec']['word']
        const us_phone = word_data['usphone']
        const uk_phone = word_data['ukphone']
        const meaning = word_data['trs']
        const raw_collins = result['collins']['collins_entries'][0]['entries']['entry']
        const collins = []
        raw_collins.forEach(collin => {
            let pos_entry = collin['tran_entry'][0]['pos_entry']
            if (pos_entry){
                collins.push({
                    'pos': pos_entry['pos'],
                    'tran': collin['tran_entry'][0]['tran'],
                })
            }
        })
        const meaning_str = meaning.map(item => {
            return `<div><span class="pos me-2">${item.pos ?? ""}</span><span>${item.tran ?? ""}</span></div>`;
        }).join("\n");
        const collins_str = collins.map(item => {
            return `<div><span class="pos me-2">${item.pos ?? ""}</span><span>${item.tran ?? ""}</span></div>`;
        }).join("\n");
        return {
            'word': word,
            'meaning': `${meaning_str}`,
            'collins': `${collins_str}`,
            'uk_phone': uk_phone,
            'us_phone': us_phone,
        }
    }

    await ankiConnect('createDeck', 6, { deck: deckName });

    await ankiConnect('createModel', 6, {
        modelName: modelName,
        inOrderFields: ['word', 'meaning', 'collins', 'uk_phone', 'us_phone'],
        isCloze: false,
        css: '.word-container{display:flex;justify-content:center;align-items:center;height:100vh}.word-card{font-family:Roboto,sans-serif;text-align:center}.word-container .word{align-content:center;height:100px;line-height:100px;border-top:4px dotted #28bea0;border-bottom:4px dotted #28bea0;font-size:48px;color:#5b5b5b;padding-bottom:5px;margin-bottom:20px}.phonetic{display:flex;font-size:20px;align-content:center;justify-content:center;color:#5b5b5b}.phonetic>div{margin:0 20px}.phonetic .mark{color:#999}.icon{width:30px;height:30px;margin-left:5px;color:#28bea0;margin-bottom:-10px}.meaning-card{display:flex;align-content:center;justify-content:center;flex-direction:column}.flex{display:flex;align-content:center}.me-2{margin-right:8px}.meaning-card .word{font-size:40px;margin:20px auto;color:#5b5b5b;padding-bottom:20px;border-bottom:4px solid #28bea0}.mt-2{margin-top:8px}.meaning{color:#5b5b5b;line-height:1.5;margin:20px auto}.collins{margin:20px auto}.pos{color:#28bea0;flex-shrink:0}',
        cardTemplates: [
            {
                Name: modelName,
                Front: '<div class="word-container"><div class="word-card"><div class="word">{{word}}</div><div class="phonetic"><div><span>UK</span> <span class="mark">/{{uk_phone}}/</span> <svg onclick=\'playAudio("uk")\' t="1730342206150" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1654" width="200" height="200"><path d="M448 282.4v459.2L301.6 594.4 282.4 576H192V448h90.4l18.4-18.4L448 282.4M512 128L256 384H128v256h128l256 256V128z m64 5.6v64.8c145.6 29.6 256 159.2 256 313.6s-110.4 284-256 313.6v64.8c181.6-30.4 320-188 320-378.4S757.6 164 576 133.6z m0 188.8v65.6c55.2 14.4 96 64 96 124s-40.8 109.6-96 124v65.6C666.4 686.4 736 607.2 736 512s-69.6-174.4-160-189.6z" p-id="1655" fill="#28bea0"></path></svg><audio id="uk_audio" src="https://dict.youdao.com/dictvoice?type=1&audio={{word}}"></audio></div><div><span>US</span> <span class="mark">/{{us_phone}}/</span> <svg onclick=\'playAudio("us")\' t="1730342206150" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1654" width="200" height="200"><path d="M448 282.4v459.2L301.6 594.4 282.4 576H192V448h90.4l18.4-18.4L448 282.4M512 128L256 384H128v256h128l256 256V128z m64 5.6v64.8c145.6 29.6 256 159.2 256 313.6s-110.4 284-256 313.6v64.8c181.6-30.4 320-188 320-378.4S757.6 164 576 133.6z m0 188.8v65.6c55.2 14.4 96 64 96 124s-40.8 109.6-96 124v65.6C666.4 686.4 736 607.2 736 512s-69.6-174.4-160-189.6z" p-id="1655" fill="#28bea0"></path></svg><audio id="us_audio" src="https://dict.youdao.com/dictvoice?type=2&audio={{word}}"></audio></div></div></div></div><script>function playAudio(d){document.getElementById(d+"_audio").play()}</script>',
                Back: '<div class="meaning-card"><div class="word">{{word}}</div><div class="meaning">{{meaning}}</div><div class="collins">{{collins}}</div></div>',
            },
        ],
    });

    const fields = await queryWord(source)
    await ankiConnect('addNote', 6, {
        note: {
            deckName: deckName,
            modelName: modelName,
            fields: {
                ...fields,
            },
        },
    });

    async function ankiConnect(action, version, params = {}) {
        let res = await fetch(`http://127.0.0.1:${port}`, {
            method: 'POST',
            body: JSON.stringify({ action, version, params }),
        });
        return res.data;
    }
}
