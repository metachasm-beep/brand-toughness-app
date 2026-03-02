import zipfile
import xml.etree.ElementTree as ET
import sys

def docx_to_text(path):
    try:
        with zipfile.ZipFile(path, 'r') as zip_ref:
            xml_content = zip_ref.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            
            # Namespace for Word XML
            ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            
            # Extract all text blocks
            texts = []
            for paragraph in tree.findall('.//w:p', ns):
                para_text = ""
                for run in paragraph.findall('.//w:t', ns):
                    if run.text:
                        para_text += run.text
                if para_text:
                    texts.append(para_text)
            
            return "\n".join(texts)
    except Exception as e:
        return f"Error: {str(e)}"

if __name__ == "__main__":
    if len(sys.argv) > 1:
        text = docx_to_text(sys.argv[1])
        sys.stdout.buffer.write(text.encode('utf-8'))
    else:
        print("Usage: python script.py <path_to_docx>")
