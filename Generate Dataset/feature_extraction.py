# importing required packages for this section
from urllib.parse import urlparse,urlencode
import ipaddress
import re
import re
from bs4 import BeautifulSoup
import whois
import urllib
import urllib.request
from datetime import datetime
import requests


class Extractor():
    def __init__(self):
        self.feature_names = ['Have_IP', 'Have_At', 'URL_Depth','Redirection', 
                        'https_Domain', 'TinyURL', 'Prefix/Suffix', 'DNS_Record', 'Web_Traffic', 
                        'Domain_Age', 'Domain_End', 'iFrame', 'Mouse_Over','Right_Click', 'Web_Forwards','Punny_Code']
    # 2.Checks for IP address in URL (Have_IP)
    @staticmethod
    def havingIP(url):
        try:
            if ipaddress.ip_address(url) and Extractor.getLength(url) == 1 :
                ip = 1
        except:
            ip = 0
        return ip

    # 3.Checks the presence of @ in URL (Have_At)
    @staticmethod
    def haveAtSign(url):
        if "@" in url and Extractor.getLength(url) == 1:
            at = 1    
        else:
            at = 0    
        return at
    # 4.Finding the length of URL and categorizing (URL_Length)
    @staticmethod
    def getLength(url):
        if len(url) < 54:
            length = 0            
        else:
            length = 1            
        return length
    # 5.Gives number of '/' in URL (URL_Depth)
    @staticmethod
    def getDepth(url):
        s = urlparse(url).path.split('/')
        depth = 0
        for j in range(len(s)):
            if len(s[j]) != 0:
                depth = depth+1
        return depth

    # 6.Checking for redirection '//' in the url (Redirection)
    @staticmethod
    def redirection(url):
        pos = url.rfind('//')
        if pos > 6:
            if pos > 7:
                return 1
            else:
                return 0
        else:
            return 0

    # 7.Existence of “HTTPS” Token in the Domain Part of the URL (https_Domain)
    @staticmethod
    def httpDomain(url):
        # domain = urlparse(url).netloc
        if 'https' or 'http' in url[5:] and Extractor.getLength(url) == 1:
            return 1
        else:
            return 0

    # 8. Checking for Shortening Services in URL (Tiny_URL)
    @staticmethod
    def tinyURL(url):
            #listing shortening services
        shortening_services = r"bit\.ly|goo\.gl|shorte\.st|go2l\.ink|x\.co|ow\.ly|t\.co|tinyurl|tr\.im|is\.gd|cli\.gs|" \
                        r"yfrog\.com|migre\.me|ff\.im|tiny\.cc|url4\.eu|twit\.ac|su\.pr|twurl\.nl|snipurl\.com|" \
                        r"short\.to|BudURL\.com|ping\.fm|post\.ly|Just\.as|bkite\.com|snipr\.com|fic\.kr|loopt\.us|" \
                        r"doiop\.com|short\.ie|kl\.am|wp\.me|rubyurl\.com|om\.ly|to\.ly|bit\.do|t\.co|lnkd\.in|db\.tt|" \
                        r"qr\.ae|adf\.ly|goo\.gl|bitly\.com|cur\.lv|tinyurl\.com|ow\.ly|bit\.ly|ity\.im|q\.gs|is\.gd|" \
                        r"po\.st|bc\.vc|twitthis\.com|u\.to|j\.mp|buzurl\.com|cutt\.us|u\.bb|yourls\.org|x\.co|" \
                        r"prettylinkpro\.com|scrnch\.me|filoops\.info|vzturl\.com|qr\.net|1url\.com|tweez\.me|v\.gd|" \
                        r"tr\.im|link\.zip\.net"
        match=re.search(shortening_services,url)
        if match:
            return 1
        else:
            return 0
    # 9.Checking for Prefix or Suffix Separated by (-) in the Domain (Prefix/Suffix)
    @staticmethod
    def prefixSuffix(url):
        if '-' in urlparse(url).netloc:
            return 1            # phishing
        else:
            return 0            # legitimate
    # 12.Web traffic (Web_Traffic)
    @staticmethod
    def web_traffic(url):
        try:
            #Filling the whitespaces in the URL if any
            url = urllib.parse.quote(url)
            rank = BeautifulSoup(urllib.request.urlopen("http://data.alexa.com/data?cli=10&dat=s&url=" + url).read(), "xml").find("REACH")['RANK']
            rank = int(rank)
        except TypeError:
                print("Cant get web traffic")
                return 1
        if rank <100000:
            return 0
        else:
            return 1

    # 13.Survival time of domain: The difference between termination time and creation time (Domain_Age)  
    @staticmethod
    def domainAge(domain_name):
        creation_date = domain_name.creation_date
        expiration_date = domain_name.expiration_date
        if (isinstance(creation_date,str) or isinstance(expiration_date,str)):
            try:
                creation_date = datetime.strptime(creation_date,'%Y-%m-%d')
                expiration_date = datetime.strptime(expiration_date,"%Y-%m-%d")
            except:
                return 1
        if ((expiration_date is None) or (creation_date is None)):
            return 1
        elif ((type(expiration_date) is list) or (type(creation_date) is list)):
            return 1
        else:
            ageofdomain = abs((expiration_date - creation_date).days)
            print("Domain Age: ", ageofdomain)
            if ((ageofdomain/30) < 6):
                age = 1
            else:
                age = 0
        return age

    # 14.End time of domain: The difference between termination time and current time (Domain_End) 
    @staticmethod
    def domainEnd(domain_name):
        expiration_date = domain_name.expiration_date
        if isinstance(expiration_date,str):
            try:
                expiration_date = datetime.strptime(expiration_date,"%Y-%m-%d")
            except:
                return 1
        if (expiration_date is None):
            return 1
        elif (type(expiration_date) is list):
            return 1
        else:
            today = datetime.now()
            end = abs((expiration_date - today).days)
            if ((end/30) < 6):
                end = 1
            else:
                end = 0
            return end  

    # 15. IFrame Redirection (iFrame)
    @staticmethod
    def iframe(response):
        if response == "":
            return 1
        else:
            if re.findall(r"[<iframe>|<frameBorder>]", response.text):
                return 0
            else:
                return 1

    # 16.Checks the effect of mouse over on status bar (Mouse_Over)
    @staticmethod
    def mouseOver(response): 
        if response == "" :
            return 1
        else:
            if re.findall("<script>.+onmouseover.+</script>", response.text):
                return 1
            else:
                return 0
    
    # 17.Checks the status of the right click attribute (Right_Click)
    @staticmethod
    def rightClick(response):
        if response == "":
            return 1
        else:
            if re.findall(r"event.button ?== ?2", response.text):
                return 0
            else:
                return 1
    # 18.Checks the number of forwardings (Web_Forwards)    
    @staticmethod
    def forwarding(response):
        if response == "":
            return 1
        else:
            if len(response.history) <= 2:
                return 0
            else:
                return 1

    # 19.Punny code 
    @staticmethod
    def punnycode(url):

        vaild_regex = "/^(http|https|ftp):\/\/([A-Z0-9][A-Z0-9_-]*(?:\.[A-Z0-9][A-Z0-9_-]*)+):?(\d+)?\/?/i"
        if re.match(vaild_regex,url):
            punny = 1 
        else:
            punny = 0

        return punny
    #Function to extract features
    def __call__(self, url):
        if isinstance(url, str):
            url = url.rstrip()
            features = []
            features.append(self.havingIP(url))
            features.append(self.haveAtSign(url))
            # features.append(self.getLength(url))
            features.append(self.getDepth(url))
            features.append(self.redirection(url))
            features.append(self.httpDomain(url))
            features.append(self.tinyURL(url))
            features.append(self.prefixSuffix(url))
            
            #Domain based features (4)
            dns = 0
            try:
                domain_name = whois.whois(urlparse(url).netloc)
            # print(domain_name)
            except:
                print("Cant get domain name")
                dns = 1

            features.append(dns)
            #features.append(self.web_traffic(url))
            features.append(1 if dns == 1 else self.domainAge(domain_name))
            features.append(1 if dns == 1 else self.domainEnd(domain_name))
            
            # HTML & Javascript based features
            try:
                response = requests.get(url)
            except:
                response = ""

            features.append(self.iframe(response))
            features.append(self.mouseOver(response))
            features.append(self.rightClick(response))
            features.append(self.forwarding(response))

            features.append(self.punnycode(url))
            print(features)
            return features
        return []

if __name__ == "__main__":
    ext = Extractor()
    print(ext("https://stackoverflow.com/questions/42179046/what-flavor-of-regex-does-visual-studio-code-use"))
