package com.selenium;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

public class playlistTest {
    public static void main(String[] args) throws InterruptedException {
        System.setProperty("webdriver.chrome.driver", "C:\\Users\\kevin\\Desktop\\Selenium\\chromedriver_win32\\chromedriver.exe");
        WebDriver driver = new ChromeDriver();

        //Navigates to Spotifyn
        driver.get("https://spotipyn.chocomint.dev");

        //Logs in
        driver.findElement(By.xpath("//*[@id=\"right\"]/a/img")).click();
        driver.findElement(By.id("login-username")).sendKeys("testaccount192837436@gmail.com");
        driver.findElement(By.id("login-password")).sendKeys("TestAccount123");
        driver.findElement(By.xpath("//*[@id=\"login-button\"]")).click();
        Thread.sleep(2000);
        driver.findElement(By.xpath("//*[@id=\"auth-accept\"]")).click();

        //Clicks on "playlist" from navbar
        driver.findElement(By.xpath("//*[@id=\"sidebar\"]/div[2]/div[2]/a")).click();

        Thread.sleep(2000);

        String at = driver.getCurrentUrl();
        String et = "https://spotipyn.chocomint.dev/playlist/";

        //Test Result
        if(at.equalsIgnoreCase(et)){
            System.out.println("Test to open playlist tab: Passed");
        }
        else{
            System.out.println("Test to open playlist tab: Failed");
        }

        //Clicks on playlist 1
        driver.findElement(By.xpath("//*[@id=\"playlist\"]/div[1]/div[1]/ul/li[2]/a")).click();

        String at2 = driver.findElement(By.xpath("//*[@id=\"playlistid_5HeYF0zvRotppLbd7Va9jj\"]/div[2]")).getText();
        String et2 = "Test Playlist 1 - Juice WRLD";

        //Test Result
        if(at2.equalsIgnoreCase(et2)){
            System.out.println("Test to open test playlist 1: Passed");
        }
        else{
            System.out.println("Test to open test playlist 1: Failed");
        }

        //Clicks on playlist 2
        driver.findElement(By.xpath("//*[@id=\"playlist\"]/div[1]/div[1]/ul/li[1]/a")).click();

        String at3 = driver.findElement(By.xpath("//*[@id=\"playlistid_0cCTsWfzmSNGCC6E9yMuN0\"]/div[2]/span")).getText();
        String et3 = "Test Playlist 2 - Polo G";

        //Test Result
        if(at3.equalsIgnoreCase(et3)){
            System.out.println("Test to open test playlist 2: Passed");
        }
        else{
            System.out.println("Test to open test playlist 2: Failed");
        }

    }

    }

