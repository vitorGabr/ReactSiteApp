import app from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

let firebaseConfig = {
    apiKey: "AIzaSyDvxpZ9rO_UDkbd8N3320kHdzwnfbcUENA",
    authDomain: "gfhdfgdfg-9ebb5.firebaseapp.com",
    databaseURL: "https://gfhdfgdfg-9ebb5.firebaseio.com",
    projectId: "gfhdfgdfg-9ebb5",
    storageBucket: "gfhdfgdfg-9ebb5.appspot.com",
    messagingSenderId: "469873401067",
    appId: "1:469873401067:web:0f13e2074d3e88c3a8b2ae"
  };


export default new class Firebase{

    constructor(){
        if(!app.initializeApp.length){
            try {
                app.initializeApp(firebaseConfig)
            } catch (err) {
                console.log(err)
            }
        }
    }

    async getAllSeries(){
        let _data = [];
        await app.firestore().collection('series')
        .get().then((snapshot)=>{
            snapshot.forEach(e=>{
                _data.push(e.data());
            })
        })
        return _data;
    }

    async getSeries(_nameSerie){
        let _data = {}
        await app.firestore().collection('series')
        .doc(_nameSerie)
        .get().then((snapshot)=>{
            _data = snapshot.data()
        })
        
        return _data;
    }

    async searchSeries(_nameSerie){
        let _data = []
        const searchInput = _nameSerie.toString().toLowerCase();
        await app.firestore().collection('series')
        .orderBy('name')
        .startAt(searchInput)
        .endAt(searchInput + '\uf8ff')
        .get().then((snapshot)=>{
            snapshot.forEach(e=>{
                _data.push(e.data());
            })
        })
        return _data;
    }

    setSeasons(_nameSerie,_data){
        app.firestore().collection('series')
        .doc(_nameSerie)
        .collection('episodes')
        .doc('episodes')
        .set(_data, { merge: true })   
    }

    updateSeasons(_nameSerie,_data){
        app.firestore().collection('series')
        .doc(_nameSerie)
        .collection('episodes')
        .doc('episodes')
        .update({episodesDub: app.firestore.FieldValue.arrayUnion(..._data)})   
    }

    async getEpisodes(_nameSerie){
        let _data = [];
        await app.firestore().collection('series')
        .doc(_nameSerie)
        .collection('episodes')
        .get().then(async (snapshot)=> {
            let _listSnapshot = [];
            snapshot.forEach(_onValue => {
                _listSnapshot.push(_onValue.data())
            });
            _data.push(..._listSnapshot);
            
        })
        return _data[0];
    }


}