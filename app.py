from flask import Flask,render_template,request
from Vector import *

app = Flask(__name__)

def load_model():
	try:
		from joblib import load

		global Rfclassifier
		Rfclassifier = load('rf_model.joblib') 
	except:

		print('Lib not installed')

@app.route("/api/check",methods=["GET"])
def check():
    submit_url = request.args["url"]

    y_pred = Rfclassifier.predict(predict(submit_url))
        
    # return f"X={vec}, Predicted={y_pred[0]}" 

if __name__ == "__main__":
	load_model()
	app.run(host='0.0.0.0',port=5000,threaded=True)