package com.selenium;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

public class signOutTest {
    public static void main(String[] args) throws InterruptedException {
        System.setProperty("webdriver.chrome.driver", "C:\\Users\\kevin\\Desktop\\Selenium\\chromedriver_win32\\chromedriver.exe");
        WebDriver driver = new ChromeDriver();

        //Navigates to Spotipyn
        driver.get("https://spotipyn.chocomint.dev");

        //Logs in
        driver.findElement(By.xpath("//*[@id=\"right\"]/a/img")).click();
        driver.findElement(By.id("login-username")).sendKeys("testaccount192837436@gmail.com");
        driver.findElement(By.id("login-password")).sendKeys("TestAccount123");
        driver.findElement(By.xpath("//*[@id=\"login-button\"]")).click();
        Thread.sleep(2000);
        driver.findElement(By.xpath("//*[@id=\"auth-accept\"]")).click();

        //Signs out
        driver.findElement(By.xpath("/html/body/a")).click();

        //at = actual title, et = expected title
        String at = driver.getTitle();
        String et = "Spotipyn - Home Page";

        if(at.equalsIgnoreCase(et)){
            System.out.println("Test for signing out: Passed");
        }
        else{
            System.out.println("Test for signing out: Failed");
        }
    }
}
