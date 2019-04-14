import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
 
@Injectable()
export class RootService {
 
    constructor(private http: HttpClient){
        
    }
    getData(jsondata:any){

        let params = new HttpParams().set('serverid', jsondata.serverid).set('endtime', jsondata.endtime)
        .set('windowtime', jsondata.windowtime).set('numwindow', jsondata.numwindow);
        return this.http.get('/api/get', {
            params: params
        });
    }
}