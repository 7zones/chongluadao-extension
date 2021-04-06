from joblib import load
import numpy as np
from generate import vector


def check_vector(vec):
    try:
        vec = np.asarray(vec).reshape(1,-1)
        Rfclassifier = load('rf_model.joblib') 
        
        y_pred = Rfclassifier.predict(vec)
        
        print("X=%s, Predicted=%s" % (vec, y_pred[0]))
        # chay model
        res = y_pred[0]
        return res
    except Exception as e:
        print(e)
        print("Invalid vector")
        return 2

if __name__ == "__main__":
    vec = vector("https://www.google.com/")
    result = check_vector(vec)
    print(result)