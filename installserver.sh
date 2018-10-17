curl --silent --location https://rpm.nodesource.com/setup_8.x | sudo bash -
yum -y install nodejs
yum localinstall https://dev.mysql.com/get/mysql57-community-release-el7-9.noarch.rpm
yum -y install mysql-community-server
systemctl start mysqld
systemctl enable mysqld

yum clean all
yum -y update
yum -y install httpd
firewall-cmd --permanent --add-port=80/tcp
firewall-cmd --permanent --add-port=443/tcp
firewall-cmd --reload
systemctl start httpd
systemctl enable httpd

cd /usr/share
mkdir program
cd program
git clone https://github.com/bdt105/apidatabase.git
cd apidatabase
npm install

cd ..
git clone https://github.com/bdt105/apifs.git
cd apifs
npm install