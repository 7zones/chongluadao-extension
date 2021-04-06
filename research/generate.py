from bs4 import BeautifulSoup
import urllib
import bs4
import json
import numpy as np
import re
import socket
import whois
from datetime import datetime
import time
import pandas as pd
import tldextract

def url_length(url):
    length = len(url)
    if length < 54:
        return 1
    if 54 <= length <= 75:
        return 0
    return -1

def prefix_suffix(hostname):
    match = re.search('-', hostname)
    return -1 if match else 1

def having_sub_domain(hostname):
    if hostname.count(".") >=3:
        return -1
    else:
        return 1
    
def redirect(url):
    if "//" in str(url[7:]):
        return -1
    else: 
        return 1 
    
def digitcount(url):
    digit_num = sum([1 for c in url if c.isdigit()])
    if(digit_num <= 7):
        return 1
    else: 
        return -1

def suffixcount(url, suffix):
    number = url.count(suffix)
    if(number <= 3):
        return 1
    else: 
        return -1
    
def symbol(url):
    if "@" in url:
        return -1
    else:
        return 1 

def ip_in_url(url):
    match=re.search('(([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\.([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\.([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\.([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\/)|'  #IPv4
                        '((0x[0-9a-fA-F]{1,2})\\.(0x[0-9a-fA-F]{1,2})\\.(0x[0-9a-fA-F]{1,2})\\.(0x[0-9a-fA-F]{1,2})\\/)'  #IPv4 in hexadecimal
                        '(?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}',url)
    if match:   
        return -1
    else:
        return 1
    
def shortening_service(url):
    shortening_services = r"bit\.ly|goo\.gl|shorte\.st|go2l\.ink|x\.co|ow\.ly|t\.co|tinyurl|tr\.im|is\.gd|cli\.gs|" \
                      r"yfrog\.com|migre\.me|ff\.im|tiny\.cc|url4\.eu|twit\.ac|su\.pr|twurl\.nl|snipurl\.com|" \
                      r"short\.to|BudURL\.com|ping\.fm|post\.ly|Just\.as|bkite\.com|snipr\.com|fic\.kr|loopt\.us|" \
                      r"doiop\.com|short\.ie|kl\.am|wp\.me|rubyurl\.com|om\.ly|to\.ly|bit\.do|t\.co|lnkd\.in|db\.tt|" \
                      r"qr\.ae|adf\.ly|goo\.gl|bitly\.com|cur\.lv|tinyurl\.com|ow\.ly|bit\.ly|ity\.im|q\.gs|is\.gd|" \
                      r"po\.st|bc\.vc|twitthis\.com|u\.to|j\.mp|buzurl\.com|cutt\.us|u\.bb|yourls\.org|x\.co|" \
                      r"prettylinkpro\.com|scrnch\.me|filoops\.info|vzturl\.com|qr\.net|1url\.com|tweez\.me|v\.gd|" \
                      r"tr\.im|link\.zip\.net"
    match = re.search(shortening_services, url)
    return -1 if match else 1

def https_token(url):
    match = re.search(r"https://|http://", url)
    if match and match.start() == 0:
        url = url[match.end():]
    else:
        return -1
    match = re.search('http|https', url)
    return -1 if match else 1

def age_of_domain(domain_name):
#         dns = 0
#         try:
#             domain_name = whois.whois(url)
#         except Exception as e:
#             print("Cant access: {}!! error happen: {}".format(url, e))
#             dns = 1
        
#         if dns == 1:
#             return -1
#         else:
        creation_date = domain_name.creation_date
        expiration_date = domain_name.expiration_date
        if (isinstance(creation_date,str) or isinstance(expiration_date,str)):
            try:
                creation_date = datetime.strptime(creation_date,'%Y-%m-%d')
                expiration_date = datetime.strptime(expiration_date,"%Y-%m-%d")
            except:
                return 2
        if ((expiration_date is None) or (creation_date is None)):
            return -1
        elif ((type(expiration_date) is list) or (type(creation_date) is list)):
            return 2
        else:
            ageofdomain = abs((expiration_date - creation_date).days)
            if ((ageofdomain/30) < 6):
                return -1
            else:
                return 1
def web_traffic(url):
    try:
        rank = bs4.BeautifulSoup(urllib.request.urlopen("http://data.alexa.com/data?cli=10&dat=s&url=" + url).read(), "xml").find(
                "REACH")['RANK']
    except TypeError as e:
        print(e)
        return -1
    rank = int(rank)
    return 1 if rank < 100000 else 0

def statistical_report(url, hostname):
    try:
        ip_address = socket.gethostbyname(hostname)
    except:
        print("cant get ip_address")
        return -1
    url_match = re.search(
        r'at\.ua|usa\.cc|baltazarpresentes\.com\.br|pe\.hu|esy\.es|hol\.es|sweddy\.com|myjino\.ru|96\.lt|ow\.ly', url)
    ip_match = re.search(
        '146\.112\.61\.108|213\.174\.157\.151|121\.50\.168\.88|192\.185\.217\.116|78\.46\.211\.158|181\.174\.165\.13|46\.242\.145\.103|121\.50\.168\.40|83\.125\.22\.219|46\.242\.145\.98|'
        '107\.151\.148\.44|107\.151\.148\.107|64\.70\.19\.203|199\.184\.144\.27|107\.151\.148\.108|107\.151\.148\.109|119\.28\.52\.61|54\.83\.43\.69|52\.69\.166\.231|216\.58\.192\.225|'
        '118\.184\.25\.86|67\.208\.74\.71|23\.253\.126\.58|104\.239\.157\.210|175\.126\.123\.219|141\.8\.224\.221|10\.10\.10\.10|43\.229\.108\.32|103\.232\.215\.140|69\.172\.201\.153|'
        '216\.218\.185\.162|54\.225\.104\.146|103\.243\.24\.98|199\.59\.243\.120|31\.170\.160\.61|213\.19\.128\.77|62\.113\.226\.131|208\.100\.26\.234|195\.16\.127\.102|195\.16\.127\.157|'
        '34\.196\.13\.28|103\.224\.212\.222|172\.217\.4\.225|54\.72\.9\.51|192\.64\.147\.141|198\.200\.56\.183|23\.253\.164\.103|52\.48\.191\.26|52\.214\.197\.72|87\.98\.255\.18|209\.99\.17\.27|'
        '216\.38\.62\.18|104\.130\.124\.96|47\.89\.58\.141|78\.46\.211\.158|54\.86\.225\.156|54\.82\.156\.19|37\.157\.192\.102|204\.11\.56\.48|110\.34\.231\.42',
        ip_address)
    if url_match:
        return -1
    elif ip_match:
        return -1
    else:
        return 1

def abnormal_url(domain, hostname):
    print(hostname)
    domain_name = domain.domain_name
    if(domain_name):
        if isinstance(domain_name, list):
            for name in domain_name:
                if(name.lower() in hostname):
                    return 1
        else:
            if(domain_name.lower() in hostname):
                return 1
    return -1

def get_hostname_from_url(url):
    hostname = url
    # TODO: Put this pattern in patterns.py as something like - get_hostname_pattern.
    pattern = "https://|http://|www.|https://www.|http://www."
    pre_pattern_match = re.search(pattern, hostname)

    if pre_pattern_match:
        hostname = hostname[pre_pattern_match.end():]
        post_pattern_match = re.search("/", hostname)
        if post_pattern_match:
            hostname = hostname[:post_pattern_match.start()]

    return hostname

def main(url):
    
    feature = []
    hostname = get_hostname_from_url(url)
    ext = tldextract.extract(url)
#     try:
    feature.append(ip_in_url(url))
    feature.append(url_length(url))
    feature.append(shortening_service(url))
    feature.append(symbol(url))
    feature.append(redirect(url))
    feature.append(prefix_suffix(hostname))
    feature.append(having_sub_domain(hostname))
    feature.append(digitcount(url))
    feature.append(suffixcount(url, ext.suffix))
    feature.append(statistical_report(url, hostname))
    feature.append(web_traffic(url))
    feature.append(https_token(url))

    dns = 0
    try:
        whois_feature = whois.whois(url)
    except:
        dns = 1
    if dns:
        #age_domain
        feature.append(-1)
        #abnormal url
        feature.append(-1)
    else:
        feature.append(age_of_domain(whois_feature))
        feature.append(abnormal_url(whois_feature, hostname))
#     except:
#         print("some error happen with "+ url)
    
    return feature

col_list = ["ip_in_url", "url_length",   "shortening_service",  "symbol", "redirect", 
            "prefix_suffix","  having_sub_domain","digitcount", "suffixcount",
            "statistical_report ", "web_traffic",  "https_token", "age_domain", "abnormal_url", "label"]

df = pd.read_csv("dataset/new_data.csv")
dataframe = []
feature = []
#1 phishing 
#0 legit
for i in range(2):
    for j in df.iloc[i, :]:
        if isinstance(j, str):
            feature = main(j)
            if i == 0:
                feature.append(1)
            else:
                feature.append(0)  
        else:
            continue
        dataframe.append(feature)
dataset = pd.DataFrame(dataframe, columns = col_list)


# def alive(url):
#     try:
#         check = urllib.request.urlopen(url,timeout=10).getcode()
#         if check == 200:
#             return 1
#         else:
#             return 0
#     except timeout:      
#         return 2
#     except:
#         return 2
