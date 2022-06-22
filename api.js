export function myHTTP(){
    return {
        get(url, cb){
            let xhr = new XMLHttpRequest()
            xhr.open("GET", url)
            xhr.addEventListener("load", ()=>{
                if(Math.floor(xhr.status/100)!==2){
                    cb(`ERROR. Status code: ${xhr.status}`, xhr)
                    return
                }
                let response = JSON.parse(xhr.responseText);
                cb(null, response)
            })
            xhr.send()
        }
    }
}