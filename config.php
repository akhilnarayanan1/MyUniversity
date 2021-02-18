<?php
/**
 * DB configuration variables
**/

$botToken="xxxxxxxxx:xxxxxxxxxxxxxxx-x-xxxxxxxxxxxxxxxxx"; //Telegram bot token

Class Database
{
    private $username ;
    private $server;
    private $password ;
    private $database;
	

    public function __construct()
    {
        $this->username = "root";						//Username (Read, Insert and Update Permission)
        $this->server = "localhost";					//Server
        $this->password = "";							//Password
        $this->database = "myrgpv";						//DB Name
    }
    public function connect()
    {
		try {
			$conn = new PDO("mysql:host=$this->server;dbname=$this->database", $this->username, $this->password);
			$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); 
			return $conn;
		} catch(PDOException $e) {
			echo "Error: " . $e->getMessage();
		}
    }
}




?>
