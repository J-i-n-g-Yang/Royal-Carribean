BASE_URL = "https://www.royalcaribbean.com/content/dam/royal/resources/pdf/casino/offers/"

def generate_links(year, month):
    yy = str(year)[-2:]
    mm = str(month).zfill(2)

    chn = []
    for i in range(1, 8):
        code = f"CHN0{i}"
        filename = f"{yy}{mm}{code}.pdf"
        chn.append({
            "label": code,
            "url": BASE_URL + filename
        })

    s_codes = ["SVIP2","S01","S02","S02A","S03","S03A","S04","S05","S06","S07","S08"]
    s = []
    for code in s_codes:
        filename = f"{yy}{mm}{code}.pdf"
        s.append({
            "label": code,
            "url": BASE_URL + filename
        })

    return {
        "CHN": chn,
        "S": s
    }