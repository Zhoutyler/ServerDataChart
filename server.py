from flask import Flask, current_app, g, request, jsonify
from flaskext.mysql import MySQL
from bandwidths import BANDWIDTHS
from datetime import datetime
from json import JSONEncoder
from decimal import *

app = Flask(__name__)

# Use flask-mysql to connect mysql database
# Need to create a database named Cylera first

mysql = MySQL()
app.config['MYSQL_DATABASE_USER'] = 'root'
app.config['MYSQL_DATABASE_PASSWORD'] = 'password'
app.config['MYSQL_DATABASE_DB'] = 'Cylera'
app.config['MYSQL_DATABASE_HOST'] = 'localhost'
mysql.init_app(app)
conn = mysql.connect()
cursor = conn.cursor()

# used to parse Decimal() object into int
class DecimalJSONEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return "%d" % obj
        else:
            super(SpecializedJSONEncoder, self).default(self, obj)

app.json_encoder = DecimalJSONEncoder

def execute_query(query):
    cursor.execute(query)
    conn.commit()

def execute_many_queries(query, data):
    cursor.executemany(query, data)
    conn.commit()

@app.before_first_request
def createTable():
    print ("Start here")
    execute_query("DROP TABLE IF EXISTS ServerData")
    query = '''
    CREATE TABLE ServerData (
        id INT AUTO_INCREMENT,
        device_id VARCHAR(128),
        timestamp TIMESTAMP,
        bytes_ts INT,
        bytes_fs INT,
        PRIMARY KEY (id)
    )
    '''
    execute_query(query)
    seedTable()


def seedTable():
    query = '''
        INSERT INTO ServerData (device_id, timestamp, bytes_ts, bytes_fs) VALUES (
            %s,
            FROM_UNIXTIME(%s),
            %s,
            %s
        ) 
        '''
    data = []
    for row in BANDWIDTHS:
        data.append((row['device_id'], row['timestamp'], int(row['bytes_ts']), int(row['bytes_fs'])))
    execute_many_queries(query, data)
    print ("Seeding Database Complete!")

@app.route("/get")
def getData():
    serverid = request.args.get('serverid')
    endtime = int(request.args.get('endtime'))
    windowtime = int(request.args.get('windowtime'))
    numwindow = int(request.args.get('numwindow'))
    print (serverid, endtime, windowtime, numwindow)
    result = []
    for i in range(numwindow):
        starttime = endtime - windowtime + 1
        query = '''
        SELECT sum(bytes_ts), sum(bytes_fs) FROM ServerData
        WHERE device_id = %s AND timestamp BETWEEN FROM_UNIXTIME(%s) AND FROM_UNIXTIME(%s)
        '''
        params = (serverid, starttime, endtime)
        print ("params: ", params)
        cursor.execute(query, params)
        res = cursor.fetchall()
        print ("res: ", res)
        result.append(res)
        endtime = starttime-1
    result = tuple(result)
    return jsonify(result)

if __name__ == "__main__":
    app.run(port=5000)