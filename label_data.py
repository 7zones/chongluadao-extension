#!/usr/bin/env python
"""
This file gathers data to be used for pre-processing in training and prediction.
"""
import pandas as pd

def main():

    urls = pd.read_csv("../chongluadao.csv")
    return urls

if __name__ == "__main__":
    main()
