package com.selenium;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

public class loginTest {

    public static void main(String[] args) throws InterruptedException {
    System.setProperty("webdriver.chrome.driver", "C:\\Users\\kevin\\Desktop\\Selenium\\chromedriver_win32\\chromedriver.exe");
    WebDriver driver = new ChromeDriver();

    //Navigates to Spotipyn
    driver.get("https://spotipyn.chocomint.dev");

    //Clicks on login button
    driver.findElement(By.xpath("//*[@id=\"right\"]/a/img")).click();

    //Inputs UserName and Password
    driver.findElement(By.id("login-username")).sendKeys("testaccount192837436@gmail.com");
    driver.findElement(By.id("login-password")).sendKeys("TestAccount123");

    //Clicks on Login and Agree
    driver.findElement(By.xpath("//*[@id=\"login-button\"]")).click();
    Thread.sleep(2000);
    driver.findElement(By.xpath("//*[@id=\"auth-accept\"]")).click();

    //at = actual title, et = expected title
    String at = driver.getTitle();
    String et = "Spotipyn";

    //Test Result
    if(at.equalsIgnoreCase(et)){
        System.out.println("Test for login: Passed");
    }
    else{
        System.out.println("Test for login: Failed");
    }
    }
}
