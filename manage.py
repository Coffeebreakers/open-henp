#!/usr/bin/env python
import zipfile
import os

class ZipUtilities:

  def toZip(self, directory, xpiname):

      xpicreate = zipfile.ZipFile(xpiname, 'w', zipfile.ZIP_DEFLATED)
      for dirpath, dirnames, filenames in os.walk(directory):
          for filename in filenames:
              full_path = os.path.join(dirpath, filename)
              file_path = full_path[len(directory)+1:]
              print 'File added: ' + str(file_path)
              xpicreate.write(full_path, file_path)
      print 'File "' + xpiname + '" successfully created'

def main():
    utilities = ZipUtilities()
    xpiname = 'open-henp.xpi'
    directory = 'src'
    utilities.toZip(directory, xpiname)

main()

'''
class ZipUtilities:
 
    def toZip(self, file, filename):
        print pavement_file
        zip_file = zipfile.ZipFile(filename, 'w')
        if os.path.isfile(file):
            zip_file.write(file)
       # else:
        #   self.addFolderToZip(zip_file, file)
        zip_file.close()

    # TODO: Remove the src folder path during the zip generation
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
    directory = 'src/install.rdf'
    utilities.toZip(directory, filename)
    os.rename(filename, 'open-henp.xpi')

main()
'''