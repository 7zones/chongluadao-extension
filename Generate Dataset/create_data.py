import time
import threading
# import concurrent.futures
import queue
import pandas as pd
import requests
from feature_extraction import Extractor
urlQueue = queue.Queue()
resultQueue = queue.Queue()
dataset = pd.read_csv("dataset/chongluadaov2.csv")
dataset.head()
urls = dataset["url"].values
for url in urls:
    urlQueue.put(url)

print("Queue size ", urlQueue.qsize())
time.sleep(4)
visited = []
extractor = Extractor()
def crawl_info(threadName):
    while not exitFlag:
        if(not urlQueue.empty()):
            url = urlQueue.get()
            print("Thread-{} crawl info of {}".format(threadName, url))
            if url not in visited:
                visited.append(url)
                features = extractor(url)
                resultQueue.put((url, features))
                print("Thread {} crawl sucessfully: {}".format(threadName, url))
                print("Have been crawled {} urls".format(len(visited)))
            else:
                continue
resultLock = threading.Lock()
results = {}
def get_result(threadName):
   while not exitFlag:
      print("Thread {} get item".format(threadName))
      if(resultQueue.empty()):
         time.sleep(1)
         continue
      url, features = resultQueue.get()
      print("Result dict have {} urls".format(len(results)))
      with resultLock:
         results[url] = features
         print("Thread {} trigger {} url remained".format(threadName, resultQueue.qsize()))
         df_last = pd.DataFrame(results.items(), columns=["urls", "features"])
         df_last.to_csv("chongluadao_dataset.csv", index = False)
   if(resultQueue.empty()):
      with resultLock:
         print("hahahahahaha")
         pd.DataFrame(results.items(), columns=["urls", "features"]).to_csv("chongluadao_dataset_final.csv", index = False)

# result lock
exitFlag = 0
start = time.time()
class myThread (threading.Thread):
   def __init__(self, threadID):
      threading.Thread.__init__(self)
      self.threadID = str(threadID)
   def run(self):
      print ("Starting thread " + self.threadID)
      if(int(self.threadID) < 2):
        print("Get result")
        get_result(self.threadID)
      else:
        crawl_info(self.threadID)
      print ("Exiting thread " + self.threadID)

threads = []

import os 
num_threads = os.cpu_count() * 10
print("Start with {} threads".format(num_threads))
time.sleep(5)

for threadID in range(0, num_threads):
   thread = myThread(threadID)
   thread.start()
   threads.append(thread)

while not (urlQueue.empty() and resultQueue.empty()):
   pass

exitFlag = 1

for t in threads:
   t.join()
print ("Exiting Main Thread")
print(time.time() - start)

# resultQueue.get()
