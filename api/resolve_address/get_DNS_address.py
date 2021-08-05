import dns.resolver

'''
Method to check DNS TXT records and extract blockchain addresses

Example usage
request = get_DNS_address()
request.get_DNS_address('test1.com')
request.print_response()
print(request.parsed_response)
'''


class get_DNS_address:
    '''
        
    '''
    response = ''
    parsed_response = []

    def __init__(self):
        pass


    def get_DNS_address(self, address):
        # Oh yeah this is wildly lazy
        # just leave everything as empty if an error is thrown / can't find anything
        try:
            answers = dns.resolver.query(address, 'TXT')
            self.response = answers
            self.response_to_array()
        except:
            pass
    

    def print_response(self):
        for rdata in self.response:
            for txt_string in rdata.strings:
                if 'v=blockAddress1' in str(txt_string):
                    print(' TXT:', txt_string)
    
    def response_to_array(self):
        response_array = []
        for rdata in self.response:
            for txt_string in rdata.strings:
                if 'v=blockAddress1' in str(txt_string):
                    line = {}
                    for attribute in txt_string.decode("utf-8").split():
                        temp_attribute = attribute.split('=')
                        line[temp_attribute[0]]= temp_attribute[1]
                    response_array.append(line)
        self.parsed_response = response_array
                            