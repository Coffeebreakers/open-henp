#!/usr/bin/env python
import zipfile
import os


class ZipUtilities:

    def toZip(self, file, filename):
        zip_file = zipfile.ZipFile(filename, 'w')
        if os.path.isfile(file):
        	zip_file.write(file)
        else:
        	self.addFolderToZip(zip_file, file)
        zip_file.close()

    def addFolderToZip(self, zip_file, folder):
        for file in os.listdir(folder):
            full_path = os.path.join(folder, file)
            if os.path.isfile(full_path):
                print 'File added: ' + str(full_path)
                zip_file.write(full_path)
            elif os.path.isdir(full_path):
                print 'Entering folder: ' + str(full_path)
                self.addFolderToZip(zip_file, full_path)

def main():
    utilities = ZipUtilities()
    filename = 'open-henp.zip'
    directory = 'src'
    utilities.toZip(directory, filename)
    os.rename(filename, 'open-henp.xpi')

main()
