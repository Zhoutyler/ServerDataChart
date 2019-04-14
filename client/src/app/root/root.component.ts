import { Component } from '@angular/core';
import { RootService } from './root.service';
import { Chart } from 'chart.js';
 
@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  providers: [RootService],
  styleUrls: ['root.component.css']
})
export class RootComponent {
    serverID = "cf4844bc-a107-4e0a-84e1-fa04d76d388c";
    endTime = "1524835983";
    windowTime = "";
    numWindow = "";
    ts_data = []
    fs_data = []
    label = []
    chart = []

    constructor(private messagesService : RootService) {
    }
    onClickQueryBtn() {
        console.log(this.serverID);
        if (this.serverID == "") {
            alert("Server Field shouldn't be null!");
        }

        var jsondata = this.prepareData();

        this.messagesService.getData(jsondata).subscribe(result => {
            console.log (result);
            // flatten data
            this.ts_data = []
            this.fs_data = []
            for (var i = 0; i < jsondata.numwindow; i++) {
                this.ts_data.push(Number(result[i][0][0]));
                this.fs_data.push(Number(result[i][0][1]));
            }
            // create xlabel (window ending timestamp)
            var endtime = Number(jsondata.endtime);
            this.label = []
            for (var i = 0; i < jsondata.numwindow; i++) {
                this.label.push(this.convertUnixTimestamp(endtime));
                endtime -= jsondata.windowtime;
            }
            // flip data to make earliest first
            this.label.reverse();
            this.ts_data.reverse();
            this.fs_data.reverse();
            console.log(this.ts_data);
            console.log(this.fs_data);
            console.log(this.label);
            this.updateChart();

        }, error => {
            console.log("Get Data Failed: ", error);
        }
        );


    }

    prepareData() {
        var _endTime;
        if (this.endTime == "")
            _endTime = Math.round((new Date()).getTime() / 1000);
        else
            _endTime = this.endTime;
        console.log(_endTime);

        var _windowTime;
        if (this.windowTime == "")
            _windowTime = 60;
        else
            _windowTime = Number(this.windowTime);
        console.log(_windowTime)

        var _numWindow;
        if (this.numWindow == "")
            _numWindow = 10;
        else
            _numWindow = Number(this.numWindow);
        console.log(_numWindow)

        var jsondata = {
            "serverid": this.serverID,
            "endtime" : _endTime,
            "windowtime" : _windowTime,
            "numwindow" : _numWindow
        }
        return jsondata;
    }

    updateChart() {
        this.chart = new Chart('canvas', {
            type: 'line',
            data: {
                labels: this.label,
                datasets: [
                {   
                    label: "From Server",
                    data: this.fs_data,
                    borderColor: '#3cba9f',
                    fill: false
                },
                {
                    label: "To Server",
                    data: this.ts_data,
                    borderColor: '#3cb000',
                    fill: false
                }                
                ]
            },
            options: {
                legend: {
                display: true
                },
                scales: {
                xAxes: [{
                    display: true
                }],
                yAxes: [{
                    display: true
                }],
                }
            }
            });
    }


    convertUnixTimestamp(timestamp) {
        var date = new Date(timestamp*1000);
        var month = date.toLocaleString('en-us', { month: 'short' });
        var dt = date.getDate();
        var hours = date.getHours();
        var minutes = "0" + date.getMinutes();
        var seconds = "0" + date.getSeconds();
        return month + " " + dt + ", " + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    }
}