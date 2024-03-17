pip install -r requirements.txt
cd src
npm install
npm run dev
npx cypress open
mariadb -u localhost -pyour_root_password -P 3306 -h your_host your_database_name -e "SELECT * FROM users;"

